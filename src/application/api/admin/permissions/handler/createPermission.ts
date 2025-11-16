import { isFailure } from '@yuukihayashi0510/core'
import { z } from 'zod'
import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { createPermissionUseCase } from '@/domain/permission'
import { permissionInputSchema } from '@/domain/permission/schema/permissionSchema'
import getRdbClient from '@/infrastructure/rdb'

export const jsonSchema = permissionInputSchema

export default async function createPermission(c: ZodValidatedContext<z.infer<typeof jsonSchema>>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const parsedJson = c.req.valid('json')

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createPermissionUseCase(rdb)

  const result = await useCase.createPermission(parsedJson)
  if (isFailure(result)) {
    logger.error('Failed to create permission', { error: result.error })
    throw handleError(result.error, logger)
  }

  return c.json(
    {
      permission: result.data,
    },
    201,
  )
}
