import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ServerError, ClientError } from '@/common/errors';
import getRdbClient from '@/infrastructure/rdb';
import { logger } from '@/logger/logger';
import { Env } from '@/application/env';
import ArticleQueryServiceImpl from '@/domain/article/infrastructure/articleQueryServiceImpl';
import ArticleService from '@/domain/article/service/articleService';
import { isSuccess, isError } from '@/common/types/utility';

export default async function getArticles(c: Context<Env>) {
  const query = c.req.query();

  const rdb = getRdbClient(c.env.DATABASE_URL);
  const articleQueryService = new ArticleQueryServiceImpl(rdb);
  const service = new ArticleService(articleQueryService);

  const result = await service.searchArticles(query);

  if (isSuccess(result)) {
    const articles = result.data;
    logger.info('articles retrieved successfully', { count: articles.length });
    return c.json(
      articles.map((article) => ({
        articleId: article.articleId.toString(),
        media: article.media,
        title: article.title,
        author: article.author,
        description: article.description,
        url: article.url,
        createdAt: article.createdAt.toISOString(),
      })),
    );
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
