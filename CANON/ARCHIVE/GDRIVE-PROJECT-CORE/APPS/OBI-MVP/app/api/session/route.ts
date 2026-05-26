/**
 * app/api/session/route.ts
 * Session management endpoints
 */

import { NextRequest, NextResponse } from "next/server";
import { createStudent, getStudentState } from "@/lib/memory";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, action } = body;

    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    if (action === "init") {
      // Create new student session
      const student = await createStudent(email);
      return NextResponse.json({
        studentId: student.id,
        level: student.level,
        weakPoints: student.weakPoints,
        streak: student.streak,
      });
    }

    if (action === "load") {
      // This shouldn't work with just email - would need to fetch by email
      // For MVP, we use studentId for all operations
      return NextResponse.json(
        { error: "Use GET /api/student/:id instead" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
