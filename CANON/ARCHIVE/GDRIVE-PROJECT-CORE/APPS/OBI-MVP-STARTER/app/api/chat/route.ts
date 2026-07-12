import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize OpenAI / DeepSeek (use OPENAI_API_KEY or DEEPSEEK_API_KEY in .env.local)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL || undefined, // optional
});

const OBI_SYSTEM_PROMPT = `You are OBI, an English speaking coach for Vietnamese learners.

Your role:
1. Correct the student's English
2. Explain the fix clearly and briefly
3. Provide a practice prompt

Rules:
- Be supportive but direct
- Focus on the main error (not minor issues)
- Always give a short explanation
- Always give a 2-3 word repetition drill

Format your response EXACTLY like this:

CORRECTION: [corrected sentence]
FIX: [what was wrong, e.g. "past tense" or "/th/ pronunciation"]
EXPLANATION: [1-2 sentence explanation]
DRILL: [3-5 words to repeat to practice]

Example:
User: "I go yesterday shop buy food"
CORRECTION: I went to the shop yesterday to buy food.
FIX: Past tense (went not go) + sentence structure
EXPLANATION: We use "went" for past actions, and we say "the shop" not just "shop". The structure is: subject + past verb + to + location + to + action.
DRILL: went to the shop, to buy food, I went yesterday`;

interface ChatRequest {
  message: string;
  studentId?: string;
}

interface OBIResponse {
  correction: string;
  explanation: string;
  drill: string;
  grammaticalIssue: string;
  streak: number;
  weakPoints: string[];
}

export async function POST(req: NextRequest): Promise<NextResponse<OBIResponse | { error: string }>> {
  try {
    const body: ChatRequest = await req.json();
    const { message, studentId = 'demo-user-001' } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get or create student
    let student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      student = await prisma.student.create({
        data: {
          id: studentId,
          name: `Student ${studentId}`,
          email: `${studentId}@obi.local`,
          level: 'A1',
        },
      });
    }

    // Call AI to correct
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview', // or 'deepseek-v4-flash'
      messages: [
        {
          role: 'system',
          content: OBI_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const aiText = aiResponse.choices[0].message.content || '';

    // Parse response
    const correction = aiText.match(/CORRECTION:\s*(.+?)(?=FIX:|$)/s)?.[1]?.trim() || message;
    const explanation = aiText.match(/EXPLANATION:\s*(.+?)(?=DRILL:|$)/s)?.[1]?.trim() || '';
    const drill = aiText.match(/DRILL:\s*(.+?)$/s)?.[1]?.trim() || '';
    const grammarFix = aiText.match(/FIX:\s*(.+?)(?=EXPLANATION:|$)/s)?.[1]?.trim() || 'pronunciation';

    // Detect phoneme issues (simple heuristic)
    let phonemeIssues: string[] = [];
    const phonemeMap: { [key: string]: string } = {
      'th': 'Î¸',
      'sh': 'Êƒ',
      'zh': 'Ê’',
      'ng': 'Å‹',
      'r': 'É¹',
    };

    for (const [eng, ipa] of Object.entries(phonemeMap)) {
      if (grammarFix.toLowerCase().includes(eng)) {
        phonemeIssues.push(ipa);
      }
    }

    // Store mistake if it was a real error
    if (correction.toLowerCase() !== message.toLowerCase()) {
      const category = phonemeIssues.length > 0 ? 'phoneme' : 'grammar';

      let mistake = await prisma.mistake.findFirst({
        where: {
          studentId,
          category,
          detail: grammarFix,
        },
      });

      if (mistake) {
        // Increment frequency
        await prisma.mistake.update({
          where: { id: mistake.id },
          data: {
            frequency: mistake.frequency + 1,
            lastOccurrence: new Date(),
          },
        });
      } else {
        // Create new mistake
        await prisma.mistake.create({
          data: {
            studentId,
            original: message,
            corrected: correction,
            category,
            detail: grammarFix,
            frequency: 1,
          },
        });
      }

      // Update student weak points
      if (phonemeIssues.length > 0) {
        const updatedPhonemes = [
          ...new Set([...student.weakPhonemes, ...phonemeIssues]),
        ];
        student = await prisma.student.update({
          where: { id: studentId },
          data: {
            weakPhonemes: updatedPhonemes.slice(0, 5), // Keep top 5
            streakDays: Math.max(0, student.streakDays - 1), // Reset on error
          },
        });
      }
    } else {
      // Correct sentence = increment streak
      student = await prisma.student.update({
        where: { id: studentId },
        data: {
          streakDays: student.streakDays + 1,
          lastActiveAt: new Date(),
        },
      });
    }

    // Store session
    await prisma.session.create({
      data: {
        studentId,
        input: message,
        correction,
        explanation,
        practicePrompt: drill,
        grammarIssues: grammarFix ? [grammarFix] : [],
        phonemeIssues,
      },
    });

    // Log to immutable ledger
    await prisma.ledgerEntry.create({
      data: {
        action: 'session_created',
        studentId,
        metadata: JSON.stringify({
          correction: correction !== message,
          categories: [...new Set([...(['grammar'] as const), ...phonemeIssues])],
        }),
      },
    });

    return NextResponse.json({
      correction,
      explanation,
      drill,
      grammaticalIssue: grammarFix,
      streak: student.streakDays,
      weakPoints: student.weakPhonemes,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

