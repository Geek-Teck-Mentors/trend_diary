import { AsyncResult } from '@/common/types/utility'
import type { ReadHistory } from '../schema/readHistorySchema'

export interface ArticleCommandService {
  createReadHistory(
    activeUserId: bigint,
    articleId: bigint,
    readAt: Date,
  ): AsyncResult<ReadHistory, Error>

  deleteAllReadHistory(activeUserId: bigint, articleId: bigint): AsyncResult<void, Error>
}
