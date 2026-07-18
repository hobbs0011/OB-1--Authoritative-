// src/auth.js — P9: Clerk session verification for CF Workers
// Uses @clerk/backend v5+ authenticateRequest() (edge-runtime compatible).
// Soft enforcement: returns null on missing/invalid session — caller decides to block or allow.
// Hard enforcement comes in P9b when portal passwords are fully replaced.

let _clerkClient = null;
let _clerkLoadFailed = false;

async function getClerkClient(env) {
  if (_clerkLoadFailed) return null;
  if (_clerkClient) return _clerkClient;

  try {
    const mod = await import('@clerk/backend');
    _clerkClient = mod.createClerkClient({
      secretKey: env.CLERK_SECRET_KEY,
      publishableKey: env.CLERK_PUBLISHABLE_KEY,
    });
    return _clerkClient;
  } catch {
    _clerkLoadFailed = true;
    return null;
  }
}

export async function verifyClerkSession(request, env) {
  if (!env.CLERK_SECRET_KEY) return null;

  const clerkClient = await getClerkClient(env);
  if (!clerkClient) return null;

  try {
    const requestState = await clerkClient.authenticateRequest(request, {
      publishableKey: env.CLERK_PUBLISHABLE_KEY,
    });

    if (!requestState.isSignedIn) return null;

    const auth = requestState.toAuth();
    return { userId: auth.userId, sessionId: auth.sessionId };
  } catch {
    return null;
  }
}
