import { AsyncResult } from '@/common/types/utility';
import ReadHistory from '../model/readHistory';

export interface ArticleCommandService {
  createReadHistory(
    userId: bigint,
    articleId: bigint,
    readAt: Date,
  ): AsyncResult<ReadHistory, Error>;

  deleteAllReadHistory(userId: bigint, articleId: bigint): AsyncResult<void, Error>;
}
