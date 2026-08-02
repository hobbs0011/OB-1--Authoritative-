// scripts/seed-catalog.mjs — seed catalog into NET_PET_KV
// Run: node scripts/seed-catalog.mjs

import { getPlans, getAddons, replacePlans, replaceAddons } from '../src/catalog.js';

const DEFAULT_PLANS = [
  {
    id: "free",
    name: "Free",
    priceVND: 0,
    interval: "month",
    currency: "VND",
    features: ["10 words per day","Basic learning stats","Community support"],
    limits: { dailyWords: 10, aiTutor: false, adminConsole: false, voiceLab: false },
    active: true,
  },
  {
    id: "net",
    name: "NET",
    priceVND: 725000,
    interval: "month",
    currency: "VND",
    features: ["Unlimited words","Full admin console","AI tutor (all skills)","Detailed analytics","Priority support"],
    limits: { dailyWords: -1, aiTutor: true, adminConsole: true, voiceLab: true },
    active: true,
  },
  {
    id: "team",
    name: "TEAM",
    priceVND: 2490000,
    interval: "month",
    currency: "VND",
    features: ["5 seats included","Admin console","Bulk analytics","All NET features","Dedicated support"],
    limits: { dailyWords: -1, aiTutor: true, adminConsole: true, voiceLab: true, seats: 5 },
    active: true,
  },
];

const DEFAULT_ADDONS = [
  { id: "voice-lab-pack", name: "Voice Lab Pack", priceVND: 199000, currency: "VND", description: "Extra pronunciation sessions with Deepgram feedback.", active: true },
  { id: "phonics-boost", name: "Phonics Boost", priceVND: 149000, currency: "VND", description: "Targeted phonics drill bundle for TH/R/V clusters.", active: true },
];

async function main() {
  // In local script context we don't have env bindings; use wrangler kv cli or deploy-time seeder.
  console.log("[seed-catalog] Use wrangler KV put or deploy-time seeder. No local KV binding available in script.");
}

main().catch(err => { console.error(err); process.exit(1); });
