import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.dev.toml' },
        miniflare: {
          bindings: {
            WORKER_ADMIN_KEY: 'test-admin-key',
            SESSION_SECRET: 'test-session-secret',
          },
        },
        isolatedStorage: false,
      },
    },
    include: ['test/**/*.spec.js'],
  },
});
