import { isFailure } from '@yuukihayashi0510/core'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { ContentfulStatusCode } from 'hono/utils/http-status'
import { ClientError, ServerError } from '@/common/errors'
import { createPermissionUseCase } from '@/domain/permission'
import getRdbClient from '@/infrastructure/rdb'
import type { Env } from '../env'
import CONTEXT_KEY from './context'

/**
 * 権限ベースの認可ミドルウェア
 * @param resource リソース名（例: 'article', 'user'）
 * @param action アクション名（例: 'read', 'write', 'delete'）
 * @returns Honoミドルウェア
 *
 * @example
 * app.get('/api/users', authorize('user', 'list'), async (c) => { ... })
 * app.post('/api/articles', authorize('article', 'create'), async (c) => { ... })
 */
const authorize = (resource: string, action: string) => {
  return createMiddleware<Env>(async (c, next) => {
    const logger = c.get(CONTEXT_KEY.APP_LOG)

    // authenticatorミドルウェアで設定されたユーザー情報を取得
    const sessionUser = c.get(CONTEXT_KEY.SESSION_USER)
    if (!sessionUser) {
      logger.warn('authorize middleware called without authentication')
      throw new HTTPException(401, { message: 'login required' })
    }

    const rdb = getRdbClient(c.env.DATABASE_URL)
    const useCase = createPermissionUseCase(rdb)

    // 権限チェック
    const result = await useCase.hasPermission(sessionUser.activeUserId, resource, action)

    if (isFailure(result)) {
      if (result.error instanceof ClientError) {
        throw new HTTPException(result.error.statusCode as ContentfulStatusCode, {
          message: result.error.message,
        })
      }
      if (result.error instanceof ServerError) {
        logger.error('Error occurred while authorizing', { error: result.error })
        throw new HTTPException(result.error.statusCode as ContentfulStatusCode, {
          message: 'Internal Server Error',
        })
      }
      logger.error('Unexpected error occurred', { error: result.error })
      throw new HTTPException(500, { message: 'Internal Server Error' })
    }

    if (!result.data) {
      logger.warn('Permission denied', {
        activeUserId: sessionUser.activeUserId.toString(),
        resource,
        action,
      })
      throw new HTTPException(403, { message: 'Permission denied' })
    }

    // 権限がある場合は次のハンドラーに進む
    return next()
  })
}

export default authorize
