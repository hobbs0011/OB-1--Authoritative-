import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema.js';

export function getDb(env) {
  return drizzle(env.SOUL_DB, { schema });
}

export const { soul_prompts, error_log, submissions, employer_profiles } = schema;
