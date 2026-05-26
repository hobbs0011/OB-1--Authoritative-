/**
 * lib/ai.ts
 * AI Engine Integration
 * Handles LLM calls for corrections
 */

import OpenAI from "openai";
import { OBI_SYSTEM_PROMPT, OBI_CONTEXT_PROMPT, OBI_USER_PROMPT } from "./prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface OBIResponseOptions {
  studentState: any;
  recentSessions?: any[];
}

export async function getOBIResponse(
  userMessage: string,
  options: OBIResponseOptions
): Promise<{
  response: string;
  mistakes?: string[];
}> {
  const { studentState, recentSessions = [] } = options;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: OBI_SYSTEM_PROMPT + "\n\n" + OBI_CONTEXT_PROMPT(studentState),
        },
        {
          role: "user",
          content: OBI_USER_PROMPT(userMessage, recentSessions),
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const response = completion.choices[0].message.content || "";

    // Extract mistakes from response (heuristic)
    const mistakes = extractMistakeTags(response, studentState.weakPoints || []);

    return {
      response,
      mistakes,
    };
  } catch (error) {
    console.error("OBI AI Error:", error);
    throw new Error("Failed to get OBI response");
  }
}

/**
 * Generate embeddings for semantic search
 * Used by Star Map for vector retrieval
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      dimensions: 1536,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Embedding generation error:", error);
    return [];
  }
}

/**
 * Helper: Extract mistake tags from AI response
 * (Simple heuristic - could be improved)
 */
function extractMistakeTags(response: string, knownWeakPoints: string[]): string[] {
  const tags: string[] = [];

  if (response.toLowerCase().includes("pronunciation")) tags.push("pronunciation");
  if (response.toLowerCase().includes("grammar")) tags.push("grammar");
  if (response.toLowerCase().includes("tense")) tags.push("tense");
  if (response.toLowerCase().includes("vowel")) tags.push("vowel");
  if (response.toLowerCase().includes("consonant")) tags.push("consonant");

  // Check if response mentions any of student's known weak points
  knownWeakPoints.forEach((point) => {
    if (response.toLowerCase().includes(point)) tags.push(point);
  });

  return [...new Set(tags)]; // deduplicate
}
