import { isFailure } from '@yuukihayashi0510/core'
import { z } from 'zod'
import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { createPermissionUseCase } from '@/domain/permission'
import { roleInputSchema } from '@/domain/permission/schema/roleSchema'
import getRdbClient from '@/infrastructure/rdb'

export const jsonSchema = roleInputSchema

export default async function createRole(c: ZodValidatedContext<z.infer<typeof jsonSchema>>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const parsedJson = c.req.valid('json')

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createPermissionUseCase(rdb)

  const result = await useCase.createRole(parsedJson)
  if (isFailure(result)) {
    logger.error('Failed to create role', { error: result.error })
    throw handleError(result.error, logger)
  }

  return c.json(
    {
      role: result.data,
    },
    201,
  )
}
