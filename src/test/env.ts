import type { Env } from '@/application/env'

const TEST_ENV = {
  DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://postgres:password@localhost:5432/test',
  DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL ?? '',
  FEATURE_USER_ENABLED: process.env.FEATURE_USER_ENABLED ?? 'true', // テストでは常に有効にする
  SUPABASE_URL: process.env.SUPABASE_URL ?? 'http://localhost:54321',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ?? 'test-anon-key',
} satisfies Env['Bindings']

export default TEST_ENV
