import { AsyncResult, failure, isFailure, success, wrapAsyncCall } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { Command } from '@/domain/article/repository'
import type { ReadHistory } from '@/domain/article/schema/read-history-schema'
import { RdbClient } from '@/infrastructure/rdb'

export default class CommandImpl implements Command {
  constructor(private readonly db: RdbClient) {}

  async createReadHistory(
    activeUserId: bigint,
    articleId: bigint,
    readAt: Date,
  ): AsyncResult<ReadHistory, Error> {
    const result = await wrapAsyncCall(() =>
      this.db.readHistory.create({
        data: {
          activeUserId,
          articleId,
          readAt,
        },
      }),
    )
    if (isFailure(result)) {
      return failure(new ServerError(result.error))
    }

    const createdReadHistory = result.data
    const readHistory: ReadHistory = {
      readHistoryId: createdReadHistory.readHistoryId,
      activeUserId: createdReadHistory.activeUserId,
      articleId: createdReadHistory.articleId,
      readAt: createdReadHistory.readAt,
      createdAt: createdReadHistory.createdAt,
    }
    return success(readHistory)
  }

  async deleteAllReadHistory(activeUserId: bigint, articleId: bigint): AsyncResult<void, Error> {
    const result = await wrapAsyncCall(() =>
      this.db.readHistory.deleteMany({
        where: {
          activeUserId,
          articleId,
        },
      }),
    )
    if (isFailure(result)) {
      return failure(new ServerError(result.error))
    }

    return success(undefined)
  }
}
