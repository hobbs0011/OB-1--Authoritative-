/**
 * app/api/student/[id]/route.ts
 * Student data endpoints
 */

import { NextRequest, NextResponse } from "next/server";
import { getStudentState, getSessionHistory, getTopWeaknesses } from "@/lib/memory";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: studentId } = params;

    if (!studentId) {
      return NextResponse.json({ error: "studentId required" }, { status: 400 });
    }

    // Get student profile
    const student = await getStudentState(studentId);

    // Get recent sessions
    const recentSessions = await getSessionHistory(studentId, 5);

    // Get top weaknesses
    const topWeaknesses = await getTopWeaknesses(studentId);

    return NextResponse.json({
      student,
      recentSessions: recentSessions.map((s) => ({
        id: s.id,
        input: s.input,
        corrected: s.corrected,
        mistakes: s.mistakes,
        createdAt: s.createdAt,
      })),
      topWeaknesses: topWeaknesses.map((w) => ({
        tag: w.tag,
        type: w.type,
        severity: w.severity,
        confidence: w.confidence,
        timesRepeated: w.timesRepeated,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
