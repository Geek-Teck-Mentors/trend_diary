import { isFailure } from '@yuukihayashi0510/core'
import { z } from 'zod'
import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedParamContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { createRoleUseCase } from '@/domain/permission'
import getRdbClient from '@/infrastructure/rdb'

export const paramSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export default async function getRoleById(
  c: ZodValidatedParamContext<z.infer<typeof paramSchema>>,
) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const { id } = c.req.valid('param')

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createRoleUseCase(rdb)

  const [roleResult, permissionsResult] = await Promise.all([
    useCase.getRoleById(id),
    useCase.getPermissionsByRoleId(id),
  ])

  if (isFailure(roleResult)) {
    logger.error('Failed to get role', { error: roleResult.error })
    throw handleError(roleResult.error, logger)
  }

  if (isFailure(permissionsResult)) {
    logger.error('Failed to get role permissions', { error: permissionsResult.error })
    throw handleError(permissionsResult.error, logger)
  }

  if (!roleResult.data) {
    return c.json({ error: 'Role not found' }, 404)
  }

  return c.json({
    role: roleResult.data,
    permissions: permissionsResult.data,
  })
}
