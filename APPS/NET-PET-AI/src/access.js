// src/access.js — NET entitlement: purchase → access → Obi/feature eligibility

import { getAccess } from "./orders.js";

const FREE_PLAN = "free";
const DEFAULT_PLAN = "free";

function isPlanActive(plan, access) {
  if (!access || access.status === "revoked") return false;
  if (access.plan === "none") return false;
  if (access.paidUntil && new Date(access.paidUntil) <= new Date()) return false;
  return true;
}

export function planFromAccess(access) {
  return access?.plan || DEFAULT_PLAN;
}

export function requiresPaidPlan(feature) {
  const paidFeatures = ["aiTutor", "adminConsole", "voiceLab", "bulkAnalytics", "phonicsBoost", "voiceLabPack"];
  return paidFeatures.includes(feature);
}

export async function ensureFeature(env, studentId, feature) {
  const access = await getAccess(env, studentId);
  const plan = planFromAccess(access);
  if (!isPlanActive(plan, access)) return { allowed: false, plan, reason: "no_active_access" };
  if (!requiresPaidPlan(feature)) return { allowed: true, plan, reason: "feature_available_on_free" };

  // Paid gated features require a non-free plan
  if (plan === FREE_PLAN) return { allowed: false, plan, reason: "upgrade_required", feature };
  return { allowed: true, plan, reason: "allowed" };
}

export async function resolvePlanFromContext({ studentId, companyCode }) {
  if (companyCode) return { scope: "employer", ownerId: companyCode };
  if (studentId) return { scope: "student", ownerId: studentId };
  return { scope: "guest", ownerId: null };
}

export async function currentEntitlement(env, studentId) {
  const access = await getAccess(env, studentId);
  const plan = planFromAccess(access);
  const active = isPlanActive(plan, access);
  return {
    studentId,
    plan,
    active,
    status: active ? "active" : "inactive",
    paidUntil: access?.paidUntil || null,
    source: access?.source || null,
    orderId: access?.orderId || null,
  };
}
