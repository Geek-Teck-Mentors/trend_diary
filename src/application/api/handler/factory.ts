import type { PrismaClient } from '@prisma/client'
import type { Result } from '@yuukihayashi0510/core'
import { isFailure } from '@yuukihayashi0510/core'
import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { Env, SessionUser } from '@/application/env'
import CONTEXT_KEY from '@/application/middleware/context'
import { handleError } from '@/common/errors'
import type { LoggerType } from '@/common/logger'
import getRdbClient from '@/infrastructure/rdb'

// コンテキストの型定義
type RequestContext<TParam = unknown, TJson = unknown, TQuery = unknown> = {
  param: TParam
  json: TJson
  query: TQuery
  user?: SessionUser
  logger: LoggerType
}

// ハンドラー設定の型
type HandlerConfig<TUseCase, TContext, TOutput, TResponse = TOutput> = {
  // UseCaseファクトリー
  createUseCase: (rdb: PrismaClient) => TUseCase

  // メインロジック
  execute: (useCase: TUseCase, context: TContext) => Promise<Result<TOutput, Error>>

  // レスポンス変換（オプション）
  transform?: (output: TOutput) => TResponse

  // ログメッセージ（オプション）
  // outputとcontextの両方を受け取れる
  logMessage?: string | ((output: TOutput, context: TContext) => string)

  // HTTPステータスコード
  statusCode?: number

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
 *   execute: (useCase, { json }) => useCase.createPolicy(json.content),
 *   logMessage: (policy) => `Policy created: version ${policy.version}`,
 *   statusCode: 201,
 * })
 *
 * // contextを使用したログ（void型の場合に有用）
 * export default createApiHandler({
 *   createUseCase: createPrivacyPolicyUseCase,
 *   execute: (useCase, { param }) => useCase.deletePolicy(param.version),
 *   logMessage: (_, { param }) => `Policy deleted: version ${param.version}`,
 *   statusCode: 204,
 * })
 * ```
 */
export function createApiHandler<
  TUseCase,
  TParam = unknown,
  TJson = unknown,
  TQuery = unknown,
  TOutput = unknown,
  TResponse = TOutput,
>(config: HandlerConfig<TUseCase, RequestContext<TParam, TJson, TQuery>, TOutput, TResponse>) {
  return async (c: Context<Env>): Promise<Response> => {
    // 1. コンテキスト準備
    const logger = c.get(CONTEXT_KEY.APP_LOG)
    const rdb = getRdbClient(c.env.DATABASE_URL)

    // validメソッドの型安全な呼び出し
    const validParam = c.req.valid ? c.req.valid('param' as never) : undefined
    const validJson = c.req.valid ? c.req.valid('json' as never) : undefined
    const validQuery = c.req.valid ? c.req.valid('query' as never) : undefined

    const context: RequestContext<TParam, TJson, TQuery> = {
      param: validParam as TParam,
      json: validJson as TJson,
      query: validQuery as TQuery,
      user: config.requiresAuth ? c.get(CONTEXT_KEY.SESSION_USER) : undefined,
      logger,
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
      logger.info({ msg: message, data: result.data })
    }

    // 5. レスポンス変換とレスポンス返却
    const statusCode = config.statusCode ?? 200

    // 204 No Contentの場合はボディなしで返す
    if (statusCode === 204) {
      return c.body(null, 204)
    }

    const responseData = config.transform ? config.transform(result.data) : result.data
    return c.json(responseData, statusCode as ContentfulStatusCode)
  }
}

// 便利なヘルパー関数群
export const apiHandlers = {
  /**
   * 単純なGETハンドラー（ID指定）
   */
  getById: <TUseCase, TParam extends { id: number }, TOutput>(
    createUseCase: (rdb: PrismaClient) => TUseCase,
    execute: (useCase: TUseCase, id: number) => Promise<Result<TOutput, Error>>,
    entityName: string,
  ) =>
    createApiHandler<TUseCase, TParam, unknown, unknown, TOutput>({
      createUseCase,
      execute: (useCase, { param }) => execute(useCase, (param as TParam).id),
      logMessage: `${entityName} retrieved`,
    }),

  /**
   * リスト取得ハンドラー
   */
  getList: <TUseCase, TOutput>(
    createUseCase: (rdb: PrismaClient) => TUseCase,
    execute: (useCase: TUseCase) => Promise<Result<TOutput, Error>>,
    entityName: string,
  ) =>
    createApiHandler({
      createUseCase,
      execute: (useCase) => execute(useCase),
      logMessage: (data: unknown) =>
        `${entityName} list retrieved (count: ${
          // biome-ignore lint/suspicious/noExplicitAny: データ構造が動的なため
          Array.isArray(data) ? data.length : ((data as any)?.data?.length ?? 0)
        })`,
    }),

  /**
   * 作成ハンドラー
   */
  create: <TUseCase, TJson, TOutput>(
    createUseCase: (rdb: PrismaClient) => TUseCase,
    execute: (useCase: TUseCase, input: TJson) => Promise<Result<TOutput, Error>>,
    entityName: string,
  ) =>
    createApiHandler<TUseCase, unknown, TJson, unknown, TOutput>({
      createUseCase,
      execute: (useCase, { json }) => execute(useCase, json as TJson),
      logMessage: `${entityName} created`,
      statusCode: 201,
    }),

  /**
   * 更新ハンドラー
   */
  update: <TUseCase, TParam extends { id: number }, TJson, TOutput>(
    createUseCase: (rdb: PrismaClient) => TUseCase,
    execute: (useCase: TUseCase, id: number, input: TJson) => Promise<Result<TOutput, Error>>,
    entityName: string,
  ) =>
    createApiHandler<TUseCase, TParam, TJson, unknown, TOutput>({
      createUseCase,
      execute: (useCase, { param, json }) => execute(useCase, (param as TParam).id, json as TJson),
      logMessage: `${entityName} updated`,
    }),

  /**
   * 削除ハンドラー
   */
  delete: <TUseCase, TParam extends { id: number }>(
    createUseCase: (rdb: PrismaClient) => TUseCase,
    execute: (useCase: TUseCase, id: number) => Promise<Result<void, Error>>,
    entityName: string,
  ) =>
    createApiHandler<TUseCase, TParam, unknown, unknown, void>({
      createUseCase,
      execute: (useCase, { param }) => execute(useCase, (param as TParam).id),
      logMessage: `${entityName} deleted`,
      statusCode: 204,
    }),
}
