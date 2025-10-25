import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedParamContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import { createAdminUserUseCase } from '@/domain/admin'
import { createAdminAuthClient } from '@/infrastructure/auth/supabaseClient'
import getRdbClient from '@/infrastructure/rdb'

export const paramSchema = z.object({
  id: z.string().regex(/^[0-9]+$/),
})

export interface GrantAdminRoleResponse {
  adminUserId: number
  userId: string
  grantedAt: string
  grantedByAdminUserId: number
}

export default async function grantAdminRole(
  c: ZodValidatedParamContext<z.infer<typeof paramSchema>>,
) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const sessionUser = c.get(CONTEXT_KEY.SESSION_USER)
  const parsedParam = c.req.valid('param')
  const userId = BigInt(parsedParam.id)

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const supabase = createAdminAuthClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY)
  const adminUserUseCase = createAdminUserUseCase(rdb, supabase)

  // 自分に権限を付与しようとしていないかチェック
  if (userId === sessionUser.userId) {
    throw new HTTPException(400, { message: '自分自身にAdmin権限を付与することはできません' })
  }
  if (sessionUser.adminUserId === null) {
    throw new HTTPException(403, { message: 'Admin権限が必要です' })
  }

  // Admin権限付与
  const result = await adminUserUseCase.grantAdminRole(userId, sessionUser.adminUserId)
  if (isError(result)) {
    throw handleError(result.error, logger)
  }

  return c.json({
    adminUserId: result.data.adminUserId,
    userId: result.data.userId.toString(),
    grantedAt: result.data.grantedAt.toISOString(),
    grantedByAdminUserId: result.data.grantedByAdminUserId,
  })
}
