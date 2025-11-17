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

export default async function deleteRole(c: ZodValidatedParamContext<z.infer<typeof paramSchema>>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const { id } = c.req.valid('param')

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createRoleUseCase(rdb)

  const result = await useCase.deleteRole(id)
  if (isFailure(result)) {
    logger.error('Failed to delete role', { error: result.error })
    throw handleError(result.error, logger)
  }

  return c.json({ message: 'Role deleted successfully' })
}
