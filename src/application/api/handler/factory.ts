import type { Result } from '@yuukihayashi0510/core'
import { isFailure } from '@yuukihayashi0510/core'
import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode, StatusCode } from 'hono/utils/http-status'
import type { Env, SessionUser } from '@/application/env'
import CONTEXT_KEY from '@/application/middleware/context'
import { handleError } from '@/common/errors'
import type { LoggerType } from '@/common/logger'
import getRdbClient, { type RdbClient } from '@/infrastructure/rdb'

// コンテキストの型定義
export type RequestContext<TParam = unknown, TJson = unknown, TQuery = unknown> = {
  param: TParam
  json: TJson
  query: TQuery
  user?: SessionUser
  logger: LoggerType
}

// RequestContextから型パラメータを抽出するヘルパー型
type ExtractParam<T> = T extends RequestContext<infer P, unknown, unknown> ? P : unknown
type ExtractJson<T> = T extends RequestContext<unknown, infer J, unknown> ? J : unknown
type ExtractQuery<T> = T extends RequestContext<unknown, unknown, infer Q> ? Q : unknown

// ハンドラー設定の型
type HandlerConfig<TUseCase, TContext extends RequestContext, TOutput, TResponse = TOutput> = {
  // UseCaseファクトリー
  createUseCase: (rdb: RdbClient) => TUseCase

  // メインロジック
  execute: (useCase: TUseCase, context: TContext) => Promise<Result<TOutput, Error>>

  // レスポンス変換（オプション）
  transform?: (output: TOutput) => TResponse

  // ログメッセージ（オプション）
  // outputとcontextの両方を受け取れる
  logMessage?: string | ((output: TOutput, context: TContext) => string)

  // ログペイロード（オプション）
  // 大量のデータを返すハンドラーでは、このオプションを使用してサマリー情報のみをログに出力することを推奨
  logPayload?: (output: TOutput, context: TContext) => Record<string, unknown>

  // HTTPステータスコード（必須）
  statusCode: StatusCode

  // 認証が必要か
  requiresAuth?: boolean
}

/**
 * APIハンドラーを生成する高階関数
 *
 * @remarks
 * この関数を使用する際は、リクエストパラメータやボディを期待するルートには
 * 必ずバリデーションミドルウェア（zodValidator等）を適用してください。
 * バリデーションミドルウェアが適用されていない場合、param/json/queryがundefinedとなり、
 * execute関数内でランタイムエラーが発生する可能性があります。
 *
 * @example
 * ```typescript
 * // 基本的な使用例
 * export default createApiHandler({
 *   createUseCase: createPrivacyPolicyUseCase,
 *   execute: (useCase, context: RequestContext<unknown, PrivacyPolicyInput>) =>
 *     useCase.createPolicy(context.json.content),
 *   logMessage: 'Policy created',
 *   logPayload: (policy) => ({ version: policy.version }),
 *   statusCode: 201,
 * })
 *
 * // 大量のデータを返すハンドラーの例（logPayloadでサマリー情報のみをログに出力）
 * export default createApiHandler({
 *   createUseCase: createPrivacyPolicyUseCase,
 *   execute: (useCase, context: RequestContext<unknown, unknown, OffsetPaginationParams>) =>
 *     useCase.getAllPolicies(context.query.page, context.query.limit),
 *   logMessage: 'Privacy policies retrieved successfully',
 *   logPayload: (data, { query }) => ({
 *     count: data.data.length,
 *     page: query.page,
 *     limit: query.limit,
 *     total: data.total,
 *   }),
 *   statusCode: 200,
 * })
 * ```
 */
export function createApiHandler<
  TUseCase,
  TContext extends RequestContext,
  TOutput,
  TResponse = TOutput,
>(config: HandlerConfig<TUseCase, TContext, TOutput, TResponse>) {
  return async (c: Context<Env>): Promise<Response> => {
    // 1. コンテキスト準備
    const logger = c.get(CONTEXT_KEY.APP_LOG)
    const rdb = getRdbClient(c.env.DATABASE_URL)

    // バリデーションミドルウェアで検証済みのデータを取得するための型ハック
    const validParam = c.req.valid ? c.req.valid('param' as never) : undefined
    const validJson = c.req.valid ? c.req.valid('json' as never) : undefined
    const validQuery = c.req.valid ? c.req.valid('query' as never) : undefined

    const context = {
      param: validParam as ExtractParam<TContext>,
      json: validJson as ExtractJson<TContext>,
      query: validQuery as ExtractQuery<TContext>,
      user: config.requiresAuth ? c.get(CONTEXT_KEY.SESSION_USER) : undefined,
      logger,
    } as TContext

    // 認証チェック
    if (config.requiresAuth && !context.user) {
      throw new HTTPException(401, { message: 'Unauthorized' })
    }

    // 2. UseCase実行
    const useCase = config.createUseCase(rdb)
    const result = await config.execute(useCase, context)

    // 3. エラーハンドリング
    if (isFailure(result)) {
      throw handleError(result.error, logger)
    }

    // 4. ロギング
    if (config.logMessage) {
      const message =
        typeof config.logMessage === 'function'
          ? config.logMessage(result.data, context)
          : config.logMessage

      let payload: Record<string, unknown>
      if (config.logPayload) {
        payload = config.logPayload(result.data, context)
      } else if (result.data !== undefined) {
        payload = { data: result.data }
      } else {
        payload = {}
      }

      logger.info({ msg: message, ...payload })
    }

    // 5. レスポンス変換とレスポンス返却
    const statusCode = config.statusCode

    // 204 No Contentの場合はボディなしで返す
    if (statusCode === 204) {
      return c.body(null, 204)
    }

    const responseData = config.transform ? config.transform(result.data) : result.data
    return c.json(responseData, statusCode as ContentfulStatusCode)
  }
}
