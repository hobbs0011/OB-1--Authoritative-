// src/catalog.js — NET product catalog: plans, tiers, add-ons
// KV-backed catalog. Admin writes; student/read-heavy paths serve immutable catalog objects.

const DEFAULT_PLANS = [
  {
    id: "free",
    name: "Free",
    priceVND: 0,
    interval: "month",
    currency: "VND",
    features: [
      "10 words per day",
      "Basic learning stats",
      "Community support",
    ],
    limits: { dailyWords: 10, aiTutor: false, adminConsole: false, voiceLab: false },
    active: true,
  },
  {
    id: "net",
    name: "NET",
    priceVND: 725000,
    interval: "month",
    currency: "VND",
    features: [
      "Unlimited words",
      "Full admin console",
      "AI tutor (all skills)",
      "Detailed analytics",
      "Priority support",
    ],
    limits: { dailyWords: -1, aiTutor: true, adminConsole: true, voiceLab: true },
    active: true,
  },
  {
    id: "team",
    name: "TEAM",
    priceVND: 2490000,
    interval: "month",
    currency: "VND",
    features: [
      "5 seats included",
      "Admin console",
      "Bulk analytics",
      "All NET features",
      "Dedicated support",
    ],
    limits: { dailyWords: -1, aiTutor: true, adminConsole: true, voiceLab: true, seats: 5 },
    active: true,
  },
];

const DEFAULT_ADDONS = [
  {
    id: "voice-lab-pack",
    name: "Voice Lab Pack",
    priceVND: 199000,
    currency: "VND",
    description: "Extra pronunciation sessions with Deepgram feedback.",
    active: true,
  },
  {
    id: "phonics-boost",
    name: "Phonics Boost",
    priceVND: 149000,
    currency: "VND",
    description: "Targeted phonics drill bundle for TH/R/V clusters.",
    active: true,
  },
];

function catalogKey() {
  return "catalog:plans";
}
function addonKey() {
  return "catalog:addons";
}

export async function getPlans(env) {
  const raw = await env.NET_PET_KV.get(catalogKey()).catch(() => null);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* fall through to seed */ }
  }
  const seed = DEFAULT_PLANS.slice();
  await env.NET_PET_KV.put(catalogKey(), JSON.stringify(seed));
  return seed;
}

export async function getAddons(env) {
  const raw = await env.NET_PET_KV.get(addonKey()).catch(() => null);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* fall through to seed */ }
  }
  const seed = DEFAULT_ADDONS.slice();
  await env.NET_PET_KV.put(addonKey(), JSON.stringify(seed));
  return seed;
}

export async function getPlanById(env, planId) {
  const plans = await getPlans(env);
  return plans.find(p => p.id === planId) || null;
}

export async function getAddonById(env, addonId) {
  const addons = await getAddons(env);
  return addons.find(a => a.id === addonId) || null;
}

export async function replacePlans(env, plans) {
  if (!Array.isArray(plans)) throw new Error("plans must be an array");
  await env.NET_PET_KV.put(catalogKey(), JSON.stringify(plans));
}

export async function replaceAddons(env, addons) {
  if (!Array.isArray(addons)) throw new Error("addons must be an array");
  await env.NET_PET_KV.put(addonKey(), JSON.stringify(addons));
}
