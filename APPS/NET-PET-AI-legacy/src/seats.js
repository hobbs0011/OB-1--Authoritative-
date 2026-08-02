// src/seats.js — employer/team seat tracking and enforcement
// Tracks assigned seats per employer, enforces plan limits at checkout

const EMPLOYER_PREFIX = "employer:";
const SEAT_PREFIX = "seat:";

function employerKey(companyCode) {
  return `${EMPLOYER_PREFIX}${companyCode.toUpperCase().trim()}`;
}

function seatKey(companyCode, studentId) {
  return `${SEAT_PREFIX}${companyCode.toUpperCase().trim()}:${studentId.trim()}`;
}

const DEFAULT_EMPLOYER = {
  companyCode: "",
  name: "",
  plan: "team",
  seatLimit: 5,
  assignedSeats: 0,
  activeSeats: 0,
  students: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export async function getEmployer(env, companyCode) {
  if (!companyCode) return null;
  const raw = await env.NET_PET_KV.get(employerKey(companyCode)).catch(() => null);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function createEmployer(env, employer) {
  if (!employer?.companyCode) return null;
  const normalized = {
    ...DEFAULT_EMPLOYER,
    ...employer,
    companyCode: employer.companyCode.toUpperCase().trim(),
    seatLimit: employer.seatLimit || 5,
    assignedSeats: 0,
    activeSeats: 0,
    students: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await env.NET_PET_KV.put(employerKey(normalized.companyCode), JSON.stringify(normalized));
  return normalized;
}

export async function updateEmployer(env, companyCode, updates) {
  const existing = await getEmployer(env, companyCode);
  if (!existing) return null;
  const updated = {
    ...existing,
    ...updates,
    companyCode: existing.companyCode,
    updatedAt: new Date().toISOString(),
  };
  await env.NET_PET_KV.put(employerKey(companyCode), JSON.stringify(updated));
  return updated;
}

export async function assignSeat(env, companyCode, studentId, meta = {}) {
  const employer = await getEmployer(env, companyCode);
  if (!employer) {
    await createEmployer(env, { companyCode, name: meta.name || companyCode, seatLimit: meta.seatLimit || 5 });
  }
  const current = await getEmployer(env, companyCode);
  const assignedCount = current.students?.length || 0;
  if (assignedCount >= current.seatLimit) {
    return { success: false, error: `Seat limit reached (${current.seatLimit})`, employer: current };
  }
  const seatRecord = {
    companyCode: current.companyCode,
    studentId: studentId.trim(),
    plan: meta.plan || current.plan,
    status: "active",
    assignedAt: new Date().toISOString(),
    expiresAt: meta.expiresAt || new Date(Date.now() + 30 * 86400000).toISOString(),
  };
  await env.NET_PET_KV.put(seatKey(current.companyCode, studentId), JSON.stringify(seatRecord));
  const students = [...(current.students || []), studentId.trim()];
  const updated = await updateEmployer(env, current.companyCode, {
    students,
    assignedSeats: students.length,
    activeSeats: students.length,
  });
  return { success: true, seat: seatRecord, employer: updated };
}

export async function removeSeat(env, companyCode, studentId) {
  const employer = await getEmployer(env, companyCode);
  if (!employer) return { success: false, error: "Employer not found" };
  await env.NET_PET_KV.delete(seatKey(companyCode, studentId)).catch(() => {});
  const students = (employer.students || []).filter(s => s !== studentId.trim());
  const updated = await updateEmployer(env, companyCode, {
    students,
    assignedSeats: students.length,
    activeSeats: students.length,
  });
  return { success: true, employer: updated };
}

export async function getSeat(env, companyCode, studentId) {
  const raw = await env.NET_PET_KV.get(seatKey(companyCode, studentId)).catch(() => null);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function listEmployerSeats(env, companyCode) {
  const employer = await getEmployer(env, companyCode);
  if (!employer) return [];
  const seats = [];
  for (const sid of employer.students || []) {
    const seat = await getSeat(env, companyCode, sid);
    if (seat) seats.push(seat);
  }
  return seats;
}

export async function enforceSeatLimit(env, companyCode, requestedSeats) {
  const employer = await getEmployer(env, companyCode);
  if (!employer) return { allowed: true, remaining: requestedSeats || 1, limit: 5 };
  const current = employer.students?.length || 0;
  const limit = employer.seatLimit || 5;
  const requested = requestedSeats || 1;
  const remaining = Math.max(0, limit - current);
  if (current + requested > limit) {
    return { allowed: false, error: `Requested ${requested} seats but only ${remaining} available (limit: ${limit})`, current, limit, remaining };
  }
  return { allowed: true, remaining: remaining - requested, limit, current, requested };
}

export async function getEmployerStats(env, companyCode) {
  const employer = await getEmployer(env, companyCode);
  if (!employer) return null;
  const seats = await listEmployerSeats(env, companyCode);
  const activeSeats = seats.filter(s => s.status === "active").length;
  const expiredSeats = seats.filter(s => new Date(s.expiresAt) < new Date()).length;
  return {
    ...employer,
    activeSeats,
    expiredSeats,
    utilization: employer.seatLimit > 0 ? Math.round((activeSeats / employer.seatLimit) * 100) : 0,
  };
}
