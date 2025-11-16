import { isFailure } from '@yuukihayashi0510/core'
import { z } from 'zod'
import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedParamContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { createEndpointUseCase } from '@/domain/permission'
import getRdbClient from '@/infrastructure/rdb'

export const paramSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export default async function getEndpointById(
  c: ZodValidatedParamContext<z.infer<typeof paramSchema>>,
) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const { id } = c.req.valid('param')

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createEndpointUseCase(rdb)

  const [endpointResult, permissionsResult] = await Promise.all([
    useCase.getEndpointById(id),
    useCase.getPermissionsByEndpointId(id),
  ])

  if (isFailure(endpointResult)) {
    logger.error('Failed to get endpoint', { error: endpointResult.error })
    throw handleError(endpointResult.error, logger)
  }

  if (isFailure(permissionsResult)) {
    logger.error('Failed to get endpoint permissions', { error: permissionsResult.error })
    throw handleError(permissionsResult.error, logger)
  }

  if (!endpointResult.data) {
    return c.json({ error: 'Endpoint not found' }, 404)
  }

  return c.json({
    endpoint: endpointResult.data,
    permissions: permissionsResult.data,
  })
}
