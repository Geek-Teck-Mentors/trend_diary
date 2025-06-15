import Article from '@/domain/article/model/article';
import { ServerError } from '@/common/errors';
import { AsyncResult } from '@/common/types/utility';

export interface ArticleCommandService {
  create(article: Omit<Article, 'articleId' | 'createdAt'>): AsyncResult<Article, ServerError>;
  update(id: bigint, article: Partial<Article>): AsyncResult<Article, ServerError>;
  delete(id: bigint): AsyncResult<void, ServerError>;
}
