import { Hono } from 'hono'
import { Env } from '@/application/env'
import zodValidator from '@/application/middleware/zodValidator'
import { authInputSchema } from '@/domain/auth-v2'
import login from './login'
import logout from './logout'
import me from './me'
import signup from './signup'

// TODO: セキュリティ - レート制限の実装
// ブルートフォース攻撃を防ぐため、認証エンドポイントにレート制限を実装する必要がある
// 推奨実装:
// - Cloudflare Workers Rate Limiting API を使用
// - signup/login: 同一IPから 5回/分 まで
// - 認証失敗時はより厳しい制限 (例: 3回失敗で5分間ブロック)
// - レート制限超過時は 429 Too Many Requests を返す
// 参考: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
const app = new Hono<Env>()
  .post('/signup', zodValidator('json', authInputSchema), signup)
  .post('/login', zodValidator('json', authInputSchema), login)
  .delete('/logout', logout)
  .get('/me', me)

export default app
