import { AsyncResult, failure, isFailure, success, wrapAsyncCall } from '@yuukihayashi0510/core'
import { ServerError } from '@/common/errors'
import { ArticleCommand } from '@/domain/article/repository'
import type { ReadHistory } from '@/domain/article/schema/readHistorySchema'
import { RdbClient } from '@/infrastructure/rdb'

export default class ArticleCommandImpl implements ArticleCommand {
  constructor(private readonly db: RdbClient) {}

  async findOrCreateReadHistory(
    activeUserId: bigint,
    articleId: bigint,
    readAt: Date,
  ): AsyncResult<ReadHistory, Error> {
    const existingReadHistoryResult = await this.findFirstReadHistory(activeUserId, articleId)
    if (isFailure(existingReadHistoryResult)) {
      return failure(existingReadHistoryResult.error)
    }

    const existingReadHistory = existingReadHistoryResult.data
    if (existingReadHistory) {
      return success(existingReadHistory)
    }

    return this.createReadHistory(activeUserId, articleId, readAt)
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

  private async findFirstReadHistory(
    activeUserId: bigint,
    articleId: bigint,
  ): AsyncResult<ReadHistory | null, ServerError> {
    const result = await wrapAsyncCall(() =>
      this.db.readHistory.findFirst({
        where: {
          activeUserId,
          articleId,
        },
      }),
    )
    if (isFailure(result)) {
      return failure(new ServerError(result.error))
    }

    const readHistoryData = result.data
    if (!readHistoryData) {
      return success(null)
    }

    const readHistory: ReadHistory = {
      readHistoryId: readHistoryData.readHistoryId,
      activeUserId: readHistoryData.activeUserId,
      articleId: readHistoryData.articleId,
      readAt: readHistoryData.readAt,
      createdAt: readHistoryData.createdAt,
    }
    return success(readHistory)
  }

  private async createReadHistory(
    activeUserId: bigint,
    articleId: bigint,
    readAt: Date,
  ): AsyncResult<ReadHistory, ServerError> {
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
}
