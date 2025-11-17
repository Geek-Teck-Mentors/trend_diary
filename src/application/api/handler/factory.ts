import type { PrismaClient } from '@prisma/client'
import type { Result } from '@yuukihayashi0510/core'
import { isFailure } from '@yuukihayashi0510/core'
import type { Context } from 'hono'
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
  logMessage?: string | ((output: TOutput) => string)

  // HTTPステータスコード
  statusCode?: number

  // 認証が必要か
  requiresAuth?: boolean
}

/**
 * APIハンドラーを生成する高階関数
 *
 * @example
 * ```typescript
 * export default createApiHandler({
 *   createUseCase: createPrivacyPolicyUseCase,
 *   execute: (useCase, { json }) => useCase.createPolicy(json.content),
 *   logMessage: (policy) => `Policy created: version ${policy.version}`,
 *   statusCode: 201,
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

    const context: RequestContext<TParam, TJson, TQuery> = {
      param: c.req.valid?.('param') as TParam,
      json: c.req.valid?.('json') as TJson,
      query: c.req.valid?.('query') as TQuery,
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
        typeof config.logMessage === 'function' ? config.logMessage(result.data) : config.logMessage
      logger.info(message, { data: result.data })
    }

    // 5. レスポンス変換とレスポンス返却
    const statusCode = config.statusCode ?? 200

    // 204 No Contentの場合はボディなしで返す
    if (statusCode === 204) {
      return c.body(null, 204)
    }

    const responseData = config.transform ? config.transform(result.data) : result.data
    return c.json(responseData, statusCode)
  }
}

// 便利なヘルパー関数群
export const apiHandlers = {
  /**
   * 単純なGETハンドラー（ID指定）
   */
  getById: <TUseCase, _TParam extends { id: number }, TOutput>(
    createUseCase: (rdb: PrismaClient) => TUseCase,
    execute: (useCase: TUseCase, id: number) => Promise<Result<TOutput, Error>>,
    entityName: string,
  ) =>
    createApiHandler({
      createUseCase,
      execute: (useCase, { param }) => execute(useCase, param.id),
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
          (data as any).length || (data as any).data?.length || 0
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
    createApiHandler({
      createUseCase,
      execute: (useCase, { json }) => execute(useCase, json),
      logMessage: `${entityName} created`,
      statusCode: 201,
    }),

  /**
   * 更新ハンドラー
   */
  update: <TUseCase, _TParam extends { id: number }, TJson, TOutput>(
    createUseCase: (rdb: PrismaClient) => TUseCase,
    execute: (useCase: TUseCase, id: number, input: TJson) => Promise<Result<TOutput, Error>>,
    entityName: string,
  ) =>
    createApiHandler({
      createUseCase,
      execute: (useCase, { param, json }) => execute(useCase, param.id, json),
      logMessage: `${entityName} updated`,
    }),

  /**
   * 削除ハンドラー
   */
  delete: <TUseCase, _TParam extends { id: number }>(
    createUseCase: (rdb: PrismaClient) => TUseCase,
    execute: (useCase: TUseCase, id: number) => Promise<Result<void, Error>>,
    entityName: string,
  ) =>
    createApiHandler({
      createUseCase,
      execute: (useCase, { param }) => execute(useCase, param.id),
      logMessage: `${entityName} deleted`,
      statusCode: 204,
    }),
}
