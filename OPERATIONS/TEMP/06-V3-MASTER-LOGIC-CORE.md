# V3 Master Logic Core (3.0.0)

**Source**: V3_MASTER_LOGIC_CORE ChatGPT Session
**Status**: Architecture Pattern Reference

---

## EventBus Pattern

Central nervous system for inter-module communication.

```javascript
class EventBus {
  constructor() {
    this.listeners = new Map();
  }
  
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
    this.log(event, data);
  }
  
  log(event, data) {
    // Write to D1 ledger
    // Hash: SHA-256 of event + data + timestamp
  }
}
```

## Store Pattern

```javascript
class Store {
  constructor(durableObject) {
    this.state = {};
    this.do = durableObject;
  }
  
  async get(key) {
    return this.state[key] || await this.do.storage.get(key);
  }
  
  async set(key, value) {
    this.state[key] = value;
    await this.do.storage.put(key, value);
  }
}
```

## Rate Limiter (KV-backed)
```javascript
async function rateLimit(env, key, maxRequests, windowSeconds) {
  const current = await env.RATE_LIMIT.get(key);
  const count = current ? parseInt(current) : 0;
  if (count >= maxRequests) return { allowed: false, remaining: 0 };
  await env.RATE_LIMIT.put(key, String(count + 1), { expirationTtl: windowSeconds });
  return { allowed: true, remaining: maxRequests - count - 1 };
}
```

## Integration Points
- EventBus → Durable Objects (real-time)
- Store → D1 (persistent) + DO (fast)
- Utils → KV (rate limiting) + crypto (hashing)
- All patterns serve the 10-5-5-3 lesson delivery pipeline
