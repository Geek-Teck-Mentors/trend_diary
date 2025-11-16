import { isFailure } from '@yuukihayashi0510/core'
import { z } from 'zod'
import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedParamJsonContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { createPermissionUseCase } from '@/domain/permission'
import getRdbClient from '@/infrastructure/rdb'

export const paramSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const jsonSchema = z.object({
  permissionIds: z.array(z.number().int().positive()),
})

export default async function updateEndpointPermissions(
  c: ZodValidatedParamJsonContext<z.infer<typeof paramSchema>, z.infer<typeof jsonSchema>>,
) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const { id } = c.req.valid('param')
  const { permissionIds } = c.req.valid('json')

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createPermissionUseCase(rdb)

  const result = await useCase.updateEndpointPermissions(id, permissionIds)
  if (isFailure(result)) {
    logger.error('Failed to update endpoint permissions', { error: result.error })
    throw handleError(result.error, logger)
  }

  return c.json({ message: 'Endpoint permissions updated successfully' })
}
