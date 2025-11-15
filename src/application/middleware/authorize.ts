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
 * エンドポイントベースの認可ミドルウェア
 * DBに登録されたエンドポイント情報から必要な権限を自動判定してチェックする
 *
 * ## エンドポイントのセキュリティレベル
 *
 * 1. **公開エンドポイント（ミドルウェアなし）**
 *    - 認証不要、認可不要
 *    - 例: GET /api/articles（記事一覧）
 *
 * 2. **認証のみ必要（authenticatorのみ）**
 *    - ログインが必要だが、特定の権限は不要
 *    - 例: POST /api/articles/:id/read（記事を読んだ記録）
 *
 * 3. **認証 + 権限チェック必要（authenticator + authorize）**
 *    - ログインが必要で、かつDBに登録された権限が必要
 *    - 例: GET /api/admin/users（管理者のみアクセス可能）
 *
 * ## 前提条件
 * - このミドルウェアの前にauthenticatorミドルウェアが必要
 * - DBのendpointsテーブルにエンドポイント情報が登録されている必要がある
 *
 * ## 動作
 * - エンドポイントが未登録の場合: 403 Permission denied
 * - 必要な権限を持っていない場合: 403 Permission denied
 * - 必要な権限を全て持っている場合: 次のハンドラーに進む
 *
 * @returns Honoミドルウェア
 *
 * @example
 * // 権限チェックが必要なエンドポイント
 * app.get('/api/admin/users', authenticator, authorize(), getUserList)
 * app.post('/api/policies', authenticator, authorize(), createPolicy)
 *
 * @example
 * // 認証のみ必要なエンドポイント（authorizeなし）
 * app.post('/api/articles/:id/read', authenticator, readArticle)
 *
 * @example
 * // 公開エンドポイント（ミドルウェアなし）
 * app.get('/api/articles', getArticles)
 */
const authorize = () => {
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

    // リクエストパスとメソッドを取得
    const path = c.req.path
    const method = c.req.method

    // エンドポイントベースで権限チェック
    const result = await useCase.hasEndpointPermission(sessionUser.activeUserId, path, method)

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
        path,
        method,
      })
      throw new HTTPException(403, { message: 'Permission denied' })
    }

    // 権限がある場合は次のハンドラーに進む
    return next()
  })
}

export default authorize
