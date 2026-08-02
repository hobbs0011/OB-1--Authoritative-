// Minimal ESM worker shape test
// Should match the file structure in index.js

export default {
  async fetch(request, env) {
    return new Response("ok");
  }
};

export class LedgerDO {
  async fetch(request) {
    return new Response("do");
  }
}
