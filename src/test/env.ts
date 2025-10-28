import { Env } from '@/application/env'

const TEST_ENV = {
  DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://postgres:password@localhost:5432/test',
  DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL ?? '',
  FEATURE_USER_ENABLED: process.env.FEATURE_USER_ENABLED ?? 'true', // テストでは常に有効にする
  // Supabase環境変数（テストではモックを使うため実際には使用されない）
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
  SUPABASE_SERVICE_ROLE_KEY: '',
} satisfies Env['Bindings']

export default TEST_ENV
