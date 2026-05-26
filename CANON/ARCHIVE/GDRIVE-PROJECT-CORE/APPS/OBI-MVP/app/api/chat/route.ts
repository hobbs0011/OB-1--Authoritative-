/**
 * app/api/chat/route.ts
 * Main chat endpoint
 * 
 * POST /api/chat
 * Body: { studentId, message }
 * Returns: { response, mistakes, weakPoints }
 */

import { NextRequest, NextResponse } from "next/server";
import { getOBIResponse } from "@/lib/ai";
import {
  getStudentState,
  getTopWeaknesses,
  getRelevantSessions,
  saveSession,
  updateStreak,
} from "@/lib/memory";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, message } = body;

    if (!studentId || !message) {
      return NextResponse.json(
        { error: "studentId and message required" },
        { status: 400 }
      );
    }

    // Get student state
    const studentState = await getStudentState(studentId);

    // Get top weaknesses for context
    const topWeaknesses = await getTopWeaknesses(studentId, 2);

    // Get relevant past sessions for the top weakness
    let recentSessions: any[] = [];
    if (topWeaknesses.length > 0) {
      recentSessions = await getRelevantSessions(studentId, topWeaknesses[0].tag, 2);
    }

    // Call AI for correction
    const aiResult = await getOBIResponse(message, {
      studentState,
      recentSessions,
    });

    // Parse AI response (simple extraction)
    const [corrected, explanation, drill] = aiResult.response.split("\n").slice(0, 3);

    // Save session
    const session = await saveSession(
      studentId,
      message,
      corrected || aiResult.response,
      explanation || "",
      drill || "",
      aiResult.mistakes || []
    );

    // Update streak
    const newStreak = await updateStreak(studentId);

    // Return response
    return NextResponse.json({
      response: aiResult.response,
      mistakes: aiResult.mistakes,
      weakPoints: studentState.weakPoints,
      streak: newStreak,
      topWeaknesses: topWeaknesses.map((w) => ({
        tag: w.tag,
        severity: w.severity,
      })),
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
