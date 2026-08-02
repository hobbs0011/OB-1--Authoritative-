// Token tracking for Phoenix/Kilo/Claude agents
export const trackTokens=(t,agent='phoenix')=>{const n=Buffer.byteLength(t||'','utf8');return n};
export const getUsage=()=>({phoenix:0,kilo:0,claude:0});
