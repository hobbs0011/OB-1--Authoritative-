# Money meta — platform rules + what is public (2026-10-29)

Sources: Creator Hub docs (fetched markdown, `scratch/market/raw/*.md`,
`last_updated 2026-10-29`) + measured game descriptions. No revenue guesses.

## 1. Creator Rewards is the free-money lane (replaces engagement payouts 2025-07-24)
- **Daily Engagement: 5 Robux** per user-day — user spends 10+ min, game is one of the
  user's first 3 that day, user is an Active Spender ($9.99+ in past 60 days).
  Design lever: 10-minute sessions, daily reason to return, first-visit-of-day hooks.
- **Audience Expansion: 35% of the user's first $100** of qualifying purchases in their
  first 60 days — for new or reactivated users attributed to the game (share link /
  direct-link-first-session / name search + 10 min play + 100+ DAU 60-day avg).
  Design lever: share links + referral loop (already in Train 6-7: ReferralSystem).
- Awards carry a **60-day holding period**; fiat cash-out is via DevEx (separate eligibility).

## 2. Passes / dev products / subscriptions (unchanged primitives, sharper guidance)
- Passes = one-time (entry, permanent perks); dev products = repeatable (currency,
  revives, boosts, spins). Subscriptions = monthly trickle; docs stress VALUE + TRUST
  (deliver on time, every time) and mapping perks to core loop + retention.
- Internal 2x Coins (99R) / 2x XP (149R) / Revive (25R) pricing sits inside the normal
  impulse band; no conflict found with docs.

## 3. Paid random items = the meta AND the minefield (gacha law)
- Policy (`paid-random-items.md`): Robux OR Robux-bought currency spent on chance =
  **paid random item**. Must disclose **all outcomes + numerical odds summing to 100%**
  (percentages, 4+ decimals), Luck/pity/rate-up effects numerically explained and
  dynamically updated. Indirect purchases covered (keys, tickets, gem-bought spins).
- Regional lock: `PolicyService.ArePaidRandomItemsRestricted` — for restricted users the
  game MUST offer an earnable path, pre-determined order, direct purchase at expected
  value, or hide the item. **Train 6-7 already complies by design**: English-challenge
  bonus pulls = earnable path; boss-guaranteed spins are non-paid (no disclosure owed).
- In-the-wild proof that disclosure converts: TSB prints randomized-rewards odds policy
  in its own description; Lazarus holds **95.76% like** on a wave-shooter with passes.
- Docs warning: **appointment mechanics and timers are unpopular** with Roblox users —
  do not gate fun behind wait-or-pay. Sell speed + cosmetics, never power or unblockers.

## 4. Leg C status (per-game pass/dev-product lists)
- BLOCKED: `game-passes` endpoints 404 on official + roproxy hosts; votes endpoint
  Cloudflare-blocked (refusals.md). No per-game price lists measured; rows withheld.
- Public substitutes on record: DOORS monetizes via UGC-for-revive + group perks
  (in-description); BedWars runs weekly cadence + 10+ modes (breadth monetization).
