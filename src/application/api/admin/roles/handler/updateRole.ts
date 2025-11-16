import { isFailure } from '@yuukihayashi0510/core'
import { z } from 'zod'
import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedParamJsonContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { createRoleUseCase } from '@/domain/permission'
import { roleUpdateSchema } from '@/domain/permission/schema/roleSchema'
import getRdbClient from '@/infrastructure/rdb'

export const paramSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const jsonSchema = roleUpdateSchema

export default async function updateRole(
  c: ZodValidatedParamJsonContext<z.infer<typeof paramSchema>, z.infer<typeof jsonSchema>>,
) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const { id } = c.req.valid('param')
  const parsedJson = c.req.valid('json')

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createRoleUseCase(rdb)

  const result = await useCase.updateRole(id, parsedJson)
  if (isFailure(result)) {
    logger.error('Failed to update role', { error: result.error })
    throw handleError(result.error, logger)
  }

  return c.json({
    role: result.data,
  })
}
