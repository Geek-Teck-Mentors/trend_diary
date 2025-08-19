import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedParamContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import { createAdminUserService } from '@/domain/admin'
import getRdbClient from '@/infrastructure/rdb'

export const paramSchema = z.object({
  id: z.string().regex(/^[0-9]+$/),
})

export interface GrantAdminRoleResponse {
  adminUserId: number
  activeUserId: string
  grantedAt: string
  grantedByAdminUserId: number
}

export default async function grantAdminRole(
  c: ZodValidatedParamContext<z.infer<typeof paramSchema>>,
) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const sessionUser = c.get(CONTEXT_KEY.SESSION_USER)
  const parsedParam = c.req.valid('param')
  const activeUserId = BigInt(parsedParam.id)

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const adminUserService = createAdminUserService(rdb)

  // 自分に権限を付与しようとしていないかチェック
  if (activeUserId === sessionUser.activeUserId) {
    throw new HTTPException(400, { message: '自分自身にAdmin権限を付与することはできません' })
  }

  // Admin権限付与（grantedByAdminUserIdは実装詳細なので固定値を使用）
  const result = await adminUserService.grantAdminRole(activeUserId, 1)
  if (isError(result)) {
    throw handleError(result.error, logger)
  }

  return c.json({
    adminUserId: result.data.adminUserId,
    activeUserId: result.data.activeUserId.toString(),
    grantedAt: result.data.grantedAt.toISOString(),
    grantedByAdminUserId: result.data.grantedByAdminUserId,
  })
}
