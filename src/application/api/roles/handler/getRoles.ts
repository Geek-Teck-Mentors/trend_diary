import { isFailure } from '@yuukihayashi0510/core'
import { Context } from 'hono'
import CONTEXT_KEY from '@/application/middleware/context'
import { handleError } from '@/common/errors'
import { createRoleUseCase } from '@/domain/permission'
import getRdbClient from '@/infrastructure/rdb'
import type { Env } from '@/application/env'

export default async function getRoles(c: Context<Env>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createRoleUseCase(rdb)

  const result = await useCase.getAllRoles()
  if (isFailure(result)) {
    logger.error('Failed to get roles', { error: result.error })
    throw handleError(result.error, logger)
  }

  return c.json({
    roles: result.data,
  })
}
