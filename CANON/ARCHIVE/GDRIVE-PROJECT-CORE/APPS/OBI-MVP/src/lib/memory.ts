/**
 * lib/memory.ts
 * Student State + Star Map Memory System
 */

import { PrismaClient } from "@prisma/client";
import { generateEmbedding } from "./ai";

const prisma = new PrismaClient();

/**
 * Get current student state
 */
export async function getStudentState(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new Error(`Student ${studentId} not found`);
  }

  return {
    id: student.id,
    email: student.email,
    level: student.level,
    weakPoints: student.weakPoints || [],
    streak: student.streak,
    totalSessions: student.totalSessions,
    totalMinutes: student.totalMinutes,
    lastActive: student.lastActive,
  };
}

/**
 * Initialize new student
 */
export async function createStudent(email: string, level: string = "A1") {
  return prisma.student.create({
    data: {
      email,
      level,
      weakPoints: [],
      streak: 0,
    },
  });
}

/**
 * Update student weak points after session
 */
export async function updateWeakPoints(
  studentId: string,
  newMistakes: string[]
) {
  const student = await getStudentState(studentId);
  const updated = [...new Set([...(student.weakPoints || []), ...newMistakes])];

  await prisma.student.update({
    where: { id: studentId },
    data: {
      weakPoints: updated,
      totalSessions: student.totalSessions + 1,
      lastActive: new Date(),
    },
  });

  return updated;
}

/**
 * Update streak
 */
export async function updateStreak(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) throw new Error("Student not found");

  const lastActive = new Date(student.lastActive);
  const now = new Date();
  const daysSinceActive = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

  let newStreak = student.streak;
  if (daysSinceActive === 1) {
    newStreak += 1; // continue streak
  } else if (daysSinceActive > 1) {
    newStreak = 1; // reset streak
  }

  await prisma.student.update({
    where: { id: studentId },
    data: { streak: newStreak, lastActive: now },
  });

  return newStreak;
}

/**
 * STAR MAP — Core Memory Intelligence
 * 
 * A Star Node represents a learning weakness cluster.
 * Instead of storing full sessions, we store semantic anchors.
 */

export async function getOrCreateStarNode(
  studentId: string,
  tag: string,
  type: string = "general"
) {
  let starNode = await prisma.starNode.findUnique({
    where: {
      studentId_tag: { studentId, tag },
    },
  });

  if (!starNode) {
    starNode = await prisma.starNode.create({
      data: {
        studentId,
        tag,
        type,
        severity: 0.5,
        confidence: 0.5,
        embedding: await generateEmbedding(tag),
      },
    });
  }

  return starNode;
}

/**
 * When student makes a mistake, update Star Map
 */
export async function updateStarMap(
  studentId: string,
  sessionId: string,
  mistakes: string[]
) {
  for (const mistake of mistakes) {
    const starNode = await getOrCreateStarNode(studentId, mistake);

    // Increase severity
    const newSeverity = Math.min(1, starNode.severity + 0.1);
    const newConfidence = Math.min(1, starNode.confidence + 0.05);

    // Add session link
    const linkedSessions = (starNode.linkedSessions as any) || [];
    if (!linkedSessions.includes(sessionId)) {
      linkedSessions.push(sessionId);
    }

    await prisma.starNode.update({
      where: { id: starNode.id },
      data: {
        severity: newSeverity,
        confidence: newConfidence,
        linkedSessions,
        timesRepeated: starNode.timesRepeated + 1,
        lastDrilled: new Date(),
      },
    });
  }
}

/**
 * Get student's top weakness clusters (for routing)
 */
export async function getTopWeaknesses(studentId: string, limit: number = 3) {
  const starNodes = await prisma.starNode.findMany({
    where: { studentId },
    orderBy: { severity: "desc" },
    take: limit,
  });

  return starNodes;
}

/**
 * Get recent relevant sessions for context
 */
export async function getRelevantSessions(
  studentId: string,
  tag: string,
  limit: number = 3
) {
  const sessions = await prisma.session.findMany({
    where: {
      studentId,
      // Simple check: if mistakes JSON contains the tag
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return sessions.filter((s) => {
    const mistakes = (s.mistakes as any) || [];
    return mistakes.includes(tag);
  });
}

/**
 * Save session result
 */
export async function saveSession(
  studentId: string,
  input: string,
  corrected: string,
  explanation: string,
  drill: string,
  mistakes: string[]
) {
  const session = await prisma.session.create({
    data: {
      studentId,
      input,
      corrected,
      explanation,
      drill,
      mistakes,
      mistakeSeverity: mistakes.length > 0 ? 0.7 : 0,
    },
  });

  // Update Star Map
  if (mistakes.length > 0) {
    await updateStarMap(studentId, session.id, mistakes);
  }

  // Update student weak points
  await updateWeakPoints(studentId, mistakes);

  return session;
}

/**
 * Get session history for a student
 */
export async function getSessionHistory(studentId: string, limit: number = 10) {
  return prisma.session.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export default {
  getStudentState,
  createStudent,
  updateWeakPoints,
  updateStreak,
  getOrCreateStarNode,
  updateStarMap,
  getTopWeaknesses,
  getRelevantSessions,
  saveSession,
  getSessionHistory,
};
