import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ServerError, ClientError } from '@/common/errors';
import getRdbClient from '@/infrastructure/rdb';
import { Env } from '@/application/env';
import { createArticleService, Article } from '@/domain/article';
import { isError } from '@/common/types/utility';
import { ArticleListResponse, ArticleResponse } from './types/response';
import CONTEXT_KEY from '@/application/middleware/context';
import { LoggerType } from '@/logger/logger';

function convertToResponse(article: Article): ArticleResponse {
  return {
    articleId: article.articleId.toString(),
    media: article.media,
    title: article.title,
    author: article.author,
    description: article.description,
    url: article.url,
    createdAt: article.createdAt,
  };
}

function handleError(error: unknown, logger: LoggerType): HTTPException {
  if (error instanceof ClientError) {
    logger.warn('client error in search', error);
    return new HTTPException(400, {
      message: error.message,
    });
  }

  if (error instanceof ServerError) {
    logger.error('internal server error', error);
    return new HTTPException(500, {
      message: error.message,
    });
  }

  logger.error('unknown error', error);
  return new HTTPException(500, {
    message: 'unknown error',
  });
}

export default async function getArticles(c: Context<Env>) {
  const query = c.req.query();
  const logger = c.get(CONTEXT_KEY.APP_LOG);

  const rdb = getRdbClient(c.env.DATABASE_URL);
  const service = createArticleService(rdb);

  const result = await service.searchArticles(query);
  if (isError(result)) {
    throw handleError(result.error, logger);
  }

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
