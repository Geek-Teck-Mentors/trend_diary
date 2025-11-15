import { isFailure } from '@yuukihayashi0510/core'
import { z } from 'zod'
import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedParamContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { createPermissionUseCase } from '@/domain/permission'
import getRdbClient from '@/infrastructure/rdb'

export const paramSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export default async function deletePermission(
  c: ZodValidatedParamContext<z.infer<typeof paramSchema>>,
) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const { id } = c.req.valid('param')

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createPermissionUseCase(rdb)

  const result = await useCase.deletePermission(id)
  if (isFailure(result)) {
    logger.error('Failed to delete permission', { error: result.error })
    throw handleError(result.error, logger)
  }

  return c.json({ message: 'Permission deleted successfully' })
}
