import { ArticleQueryParams } from '@/domain/article';
import { ApiArticleQueryParams } from '@/domain/article/schema/articleQuerySchema';

// eslint-disable-next-line import/prefer-default-export
export function convertApiArticleQueryParams(params: ApiArticleQueryParams): ArticleQueryParams {
  return {
    limit: params.limit,
    direction: params.direction,
    cursor: params.cursor,
    title: params.title,
    author: params.author,
    media: params.media,
    from: params.from,
    to: params.to,
    readStatus: params.read_status,
  };
}
