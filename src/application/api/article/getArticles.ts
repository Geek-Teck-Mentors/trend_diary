import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ServerError, ClientError } from '@/common/errors';
import getRdbClient from '@/infrastructure/rdb';
import { logger } from '@/logger/logger';
import { Env } from '@/application/env';
import { createArticleService, Article } from '@/domain/article';
import { isSuccess, isError } from '@/common/types/utility';
import { ArticleListResponse, ArticleResponse } from './types/response';

function convertToResponse(article: Article): ArticleResponse {
  return {
    articleId: article.articleId.toString(),
    media: article.media,
    title: article.title,
    author: article.author,
    description: article.description,
    url: article.url,
    createdAt: article.createdAt.toISOString(),
  };
}

export default async function getArticles(c: Context<Env>) {
  const query = c.req.query();

  const rdb = getRdbClient(c.env.DATABASE_URL);
  const service = createArticleService(rdb);

  const result = await service.searchArticles(query);

  if (isSuccess(result)) {
    const paginationResult = result.data;
    logger.info('articles retrieved successfully', { count: paginationResult.data.length });
    const response: ArticleListResponse = {
      data: paginationResult.data.map(convertToResponse),
      nextCursor: paginationResult.nextCursor,
      prevCursor: paginationResult.prevCursor,
      hasNext: paginationResult.hasNext,
      hasPrev: paginationResult.hasPrev,
    };
    return c.json(response);
  }

  if (isError(result)) {
    const e = result.error;
    if (e instanceof ClientError) {
      logger.warn('client error in search', e);
      throw new HTTPException(400, {
        message: e.message,
      });
    }

    if (e instanceof ServerError) {
      logger.error('internal server error', e);
      throw new HTTPException(500, {
        message: e.message,
      });
    }

    logger.error('unknown error', e);
    throw new HTTPException(500, {
      message: 'unknown error',
    });
  }
}
