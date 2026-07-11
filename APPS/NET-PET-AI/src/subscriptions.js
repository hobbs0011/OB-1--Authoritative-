// src/subscriptions.js — NET subscription lifecycle: states, transitions, grace, renewal
// States: trial → active → grace → expired → past_due
// Grace period: 7 days after expiration before access is revoked

const SUBSCRIPTION_STATES = {
  TRIAL: 'trial',
  ACTIVE: 'active',
  GRACE: 'grace',
  EXPIRED: 'expired',
  PAST_DUE: 'past_due',
  REVOKED: 'revoked',
};

const GRACE_DAYS = 7;
const RENEWAL_REMINDER_DAYS = 3; // remind 3 days before expiration
const MAX_PAST_DUE_DAYS = 14;

function computeSubscriptionStatus(sub) {
  if (!sub) return SUBSCRIPTION_STATES.EXPIRED;
  if (sub.status === SUBSCRIPTION_STATES.REVOKED) return SUBSCRIPTION_STATES.REVOKED;
  const now = Date.now();
  const paidUntil = sub.paidUntil ? new Date(sub.paidUntil).getTime() : 0;
  const trialEnd = sub.trial_end ? new Date(sub.trial_end).getTime() : 0;
  if (paidUntil > now) {
    // Check if within renewal reminder window
    const daysToExpiry = Math.ceil((paidUntil - now) / 86400000);
    if (daysToExpiry <= RENEWAL_REMINDER_DAYS && daysToExpiry > 0) {
      return SUBSCRIPTION_STATES.ACTIVE; // still active, but renewal reminder should be sent
    }
    return SUBSCRIPTION_STATES.ACTIVE;
  }
  if (trialEnd > now) return SUBSCRIPTION_STATES.TRIAL;
  // Expired but within grace period
  const expiredAt = Math.max(paidUntil, trialEnd);
  const daysSinceExpiry = Math.ceil((now - expiredAt) / 86400000);
  if (daysSinceExpiry <= GRACE_DAYS) return SUBSCRIPTION_STATES.GRACE;
  if (daysSinceExpiry <= MAX_PAST_DUE_DAYS) return SUBSCRIPTION_STATES.PAST_DUE;
  return SUBSCRIPTION_STATES.EXPIRED;
}

function isSubscriptionActive(sub) {
  return computeSubscriptionStatus(sub) === SUBSCRIPTION_STATES.ACTIVE;
}

function isInGracePeriod(sub) {
  return computeSubscriptionStatus(sub) === SUBSCRIPTION_STATES.GRACE;
}

function daysUntilExpiry(sub) {
  if (!sub) return 0;
  const paidUntil = sub.paidUntil ? new Date(sub.paidUntil).getTime() : 0;
  const trialEnd = sub.trial_end ? new Date(sub.trial_end).getTime() : 0;
  const expiry = Math.max(paidUntil, trialEnd);
  if (expiry <= Date.now()) return 0;
  return Math.ceil((expiry - Date.now()) / 86400000);
}

function daysSinceExpiry(sub) {
  if (!sub) return 0;
  const paidUntil = sub.paidUntil ? new Date(sub.paidUntil).getTime() : 0;
  const trialEnd = sub.trial_end ? new Date(sub.trial_end).getTime() : 0;
  const expiry = Math.max(paidUntil, trialEnd);
  if (expiry > Date.now()) return 0;
  return Math.ceil((Date.now() - expiry) / 86400000);
}

function transitionSubscription(sub, newState) {
  if (!sub) return { ...sub, status: newState, updatedAt: new Date().toISOString() };
  const updated = {
    ...sub,
    status: newState,
    updatedAt: new Date().toISOString(),
  };
  if (newState === SUBSCRIPTION_STATES.ACTIVE && !sub.paidUntil) {
    updated.paidUntil = new Date(Date.now() + 30 * 86400000).toISOString();
  }
  return updated;
}

export {
  SUBSCRIPTION_STATES,
  GRACE_DAYS,
  RENEWAL_REMINDER_DAYS,
  MAX_PAST_DUE_DAYS,
  computeSubscriptionStatus,
  isSubscriptionActive,
  isInGracePeriod,
  daysUntilExpiry,
  daysSinceExpiry,
  transitionSubscription,
};
