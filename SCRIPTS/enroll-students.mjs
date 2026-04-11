#!/usr/bin/env node
// SCRIPTS/enroll-students.mjs
// Enrolls Michael's real students into OBI.
// Run: node SCRIPTS/enroll-students.mjs [--prod]
//
// Default target: local wrangler dev (http://localhost:8787)
// Pass --prod to target production Worker.
//
// Data is sourced from canon student files in OPERATIONS/NET-STUDENTS/

import { argv } from "process";

const isProd = argv.includes("--prod");
const BASE = isProd
  ? "https://net-pet-ai.mrmichaelhobbs1234.workers.dev"
  : "http://localhost:8787";

console.log(`\nOBI Student Enrollment — NET-PET-AI`);
console.log(`Target: ${BASE}`);
console.log(`Mode: ${isProd ? "PRODUCTION" : "local dev"}\n`);

// ── Student DNA (sourced from OPERATIONS/NET-STUDENTS/ canon files) ───────────

const STUDENTS = [
  {
    studentId: "mai-tram",
    fullName: "Mai Trâm",
    currentCity: "Ho Chi Minh City",
    birthplace: "Ho Chi Minh City",
    englishLevel: "B1-Cub",
    goals: "Business English for international trade at BlueTech. Present to foreign clients. Negotiate confidently.",
    confidenceAreas: "Reading, vocabulary recognition, formal writing",
    occupation: "HR professional, BlueTech (B2B bird's nest supplier + food ingredients)",
    fearTrigger: "Speaking without preparation, being put on the spot in front of colleagues",
    learningHistory: "2 sessions logged. Strong on vocab recognition, weak on spontaneous production. Catholic background. Responds well to real business examples.",
    motivationNow: "Needs English for career growth. B2B client meetings are coming.",
    schedule: { days: ["Tuesday", "Thursday"], time: "19:00", timezone: "Asia/Ho_Chi_Minh" },
  },
  {
    studentId: "quy-bluetech",
    fullName: "Nguyễn Thị Thu Quy",
    currentCity: "Ho Chi Minh City",
    birthplace: "Quảng Ngãi",
    englishLevel: "A2-Mouse",
    goals: "Survive English in accounting/admin at BlueTech. Read emails. Reply to foreign vendors.",
    confidenceAreas: "Very limited — needs heavy Vietnamese bridging",
    occupation: "Accounting intern, BlueTech",
    fearTrigger: "Being asked to speak English in meetings, sounds of foreign words she doesn't know",
    learningHistory: "1 session logged. Youngest in class (21). Very shy. Sister Quỳnh also at BlueTech. Needs short sessions.",
    motivationNow: "Internship survival mode. Real email tasks.",
    schedule: { days: ["Monday", "Wednesday"], time: "18:30", timezone: "Asia/Ho_Chi_Minh" },
  },
  {
    studentId: "timmy-private",
    fullName: "Timmy",
    currentCity: "Ho Chi Minh City",
    birthplace: "Ho Chi Minh City",
    englishLevel: "B1-Grade5",
    goals: "Become an astronaut. Use English to talk about science and space.",
    confidenceAreas: "Reading, games, numbers",
    occupation: "Student, Grade 5",
    fearTrigger: "Adult-style grammar drills, anything that feels like school homework",
    learningHistory: "Private student. Astronaut hook is his motivator. Responds to sci-fi and space topics.",
    motivationNow: "Space, rockets, becoming an astronaut.",
    schedule: { days: ["Saturday"], time: "10:00", timezone: "Asia/Ho_Chi_Minh" },
  },
  {
    studentId: "tracy-private",
    fullName: "Tracy",
    currentCity: "Ho Chi Minh City",
    birthplace: "Ho Chi Minh City",
    englishLevel: "B2-Advanced",
    goals: "Sound like a native speaker in games and online. Beat English-speaking opponents in arguments.",
    confidenceAreas: "Writing, listening, gaming vocabulary",
    occupation: "Student (Timmy's sister)",
    fearTrigger: "Feeling like she's going backwards, baby-level content",
    learningHistory: "Private student. Advanced level. Gamer identity — frame everything as a challenge/battle.",
    motivationNow: "Gamer. Wants to dominate online English speakers.",
    schedule: { days: ["Saturday"], time: "11:30", timezone: "Asia/Ho_Chi_Minh" },
  },
  {
    studentId: "dan-private",
    fullName: "Dan",
    currentCity: "Ho Chi Minh City",
    birthplace: "Ho Chi Minh City",
    englishLevel: "A1-Tiger-Candidate",
    goals: "Speak English with confidence. Follow instructions in English.",
    confidenceAreas: "Energy, enthusiasm, not afraid to try",
    occupation: "Student, 7 years old",
    fearTrigger: "Long sessions, abstract concepts, sitting still",
    learningHistory: "Youngest active student (7yo). Tiger candidate — unusually brave for his age. Short sessions only (20-25 min).",
    motivationNow: "Fun. Movement. Games. Anything physical or cartoon-themed.",
    schedule: { days: ["Sunday"], time: "09:30", timezone: "Asia/Ho_Chi_Minh" },
  },
  {
    studentId: "minh-private",
    fullName: "Minh",
    currentCity: "Ho Chi Minh City",
    birthplace: "Ho Chi Minh City",
    englishLevel: "A0-Beginner-5yo",
    goals: "Learn English words through play. Build phonics foundation.",
    confidenceAreas: "Listening (absorbs like a sponge at this age)",
    occupation: "Student, 5 years old",
    fearTrigger: "Confusion, not understanding instructions, adults who are impatient",
    learningHistory: "Newest student (5yo). Mom has parent login. Lesson picker (illusion of choice — Michael pre-curates). 15-20 min sessions max. Phonics + story + single vocabulary theme per session.",
    motivationNow: "Animals, dinosaurs, colors, simple stories. Mom visibility is key — she needs to see progress.",
    schedule: { days: ["Sunday"], time: "08:00", timezone: "Asia/Ho_Chi_Minh" },
    parentId: "minh-mom",
  },
];

// ── Enrollment runner ─────────────────────────────────────────────────────────

async function post(endpoint, body) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try { return { status: res.status, data: JSON.parse(text) }; }
  catch { return { status: res.status, data: text }; }
}

async function enrollStudent(student) {
  const { schedule, parentId, ...profile } = student;
  const name = student.fullName;

  // 1. Create profile
  const onboard = await post("/api/onboarding", profile);
  if (onboard.status !== 200) {
    console.error(`  ✗ ${name}: onboarding failed (${onboard.status}) — ${JSON.stringify(onboard.data)}`);
    return false;
  }
  console.log(`  ✓ ${name} (${student.studentId}): profile created`);

  // 2. Set schedule
  if (schedule) {
    const sched = await post("/api/schedule/set", { studentId: student.studentId, schedule });
    if (sched.status === 200) {
      console.log(`  ✓ ${name}: schedule set — ${schedule.days.join(", ")} @ ${schedule.time}`);
    } else {
      console.warn(`  ⚠ ${name}: schedule set failed — ${JSON.stringify(sched.data)}`);
    }
  }

  return true;
}

async function checkHealth() {
  try {
    const res = await fetch(`${BASE}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log(`Worker alive — v${data.version}, ${data.routes} routes\n`);
    return true;
  } catch (err) {
    console.error(`Worker not reachable at ${BASE}: ${err.message}`);
    if (!isProd) console.error(`Start local dev with: cd APPS/NET-PET-AI && npx wrangler dev`);
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const alive = await checkHealth();
if (!alive) process.exit(1);

let enrolled = 0;
for (const student of STUDENTS) {
  console.log(`Enrolling: ${student.fullName} (${student.studentId})`);
  const ok = await enrollStudent(student);
  if (ok) enrolled++;
  console.log("");
}

console.log(`\nEnrollment complete: ${enrolled}/${STUDENTS.length} students wired into OBI.`);
if (enrolled < STUDENTS.length) {
  console.log(`\n⚠ Some enrollments failed. Check errors above.`);
  process.exit(1);
}
console.log(`\nNext step: POST /api/session/log for each student's most recent real class.`);
console.log(`Then: GET /api/digest to verify all students appear in the daily report.`);
