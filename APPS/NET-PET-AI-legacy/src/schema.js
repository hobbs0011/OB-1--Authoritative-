import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const soul_prompts = sqliteTable('soul_prompts', {
  id: text('id').primaryKey(),
  session_id: text('session_id'),
  student_id: text('student_id'),
  byte_count: integer('byte_count'),
  content: text('content'),
  created_at: text('created_at'),
});

export const error_log = sqliteTable('error_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ts: integer('ts'),
  tag: text('tag'),
  message: text('message'),
  detail: text('detail'),
  student_id: text('student_id'),
});

export const submissions = sqliteTable('submissions', {
  ref: text('ref').primaryKey(),
  assessment: text('assessment'),
  age_group: text('age_group'),
  student_name: text('student_name'),
  submitted_at: text('submitted_at'),
  payload: text('payload'),
  created_at: text('created_at'),
});

export const employer_profiles = sqliteTable('employer_profiles', {
  id: text('id').primaryKey(),
  company: text('company'),
  contact_email: text('contact_email'),
  created_at: text('created_at'),
});

export const audit_log = sqliteTable('audit_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ts: integer('ts').notNull(),
  action: text('action').notNull(),
  actor: text('actor').notNull(),
  target: text('target').notNull(),
});

export const audit_log_v2 = sqliteTable('audit_log_v2', {
  id: text('id').primaryKey(),
  ts: integer('ts').notNull(),
  action: text('action').notNull(),
  target: text('target').notNull(),
  performed_by: text('performed_by').notNull(),
  metadata: text('metadata'),
});
