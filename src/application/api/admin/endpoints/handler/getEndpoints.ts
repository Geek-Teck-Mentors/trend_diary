import { isFailure } from '@yuukihayashi0510/core'
import { Context } from 'hono'
import CONTEXT_KEY from '@/application/middleware/context'
import { handleError } from '@/common/errors'
import { createEndpointUseCase } from '@/domain/permission'
import getRdbClient from '@/infrastructure/rdb'
import type { Env } from '../../../../env'

export default async function getEndpoints(c: Context<Env>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const useCase = createEndpointUseCase(rdb)

  const result = await useCase.getAllEndpoints()
  if (isFailure(result)) {
    logger.error('Failed to get endpoints', { error: result.error })
    throw handleError(result.error, logger)
  }

  return c.json({
    endpoints: result.data,
  })
}
