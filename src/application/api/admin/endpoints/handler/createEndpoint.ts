import { isFailure } from '@yuukihayashi0510/core'
import { z } from 'zod'
import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { createPermissionUseCase } from '@/domain/permission'
import { endpointInputSchema } from '@/domain/permission/schema/endpointSchema'
import getRdbClient from '@/infrastructure/rdb'

export const jsonSchema = endpointInputSchema

export default async function createEndpoint(c: ZodValidatedContext<z.infer<typeof jsonSchema>>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const parsedJson = c.req.valid('json')

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createPermissionUseCase(rdb)

  const result = await useCase.createEndpoint(parsedJson)
  if (isFailure(result)) {
    logger.error('Failed to create endpoint', { error: result.error })
    throw handleError(result.error, logger)
  }

  return c.json(
    {
      endpoint: result.data,
    },
    201,
  )
}
