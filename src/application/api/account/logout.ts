import { deleteCookie } from 'hono/cookie';
import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { Env } from '@/application/env';
import { NotFoundError, ServerError } from '@/common/errors';
import { AccountRepositoryImpl, AccountService, UserRepositoryImpl } from '@/domain/account';
import getRdbClient from '@/infrastructure/rdb';
import { logger } from '@/logger/logger';
import CONTEXT_KEY from '@/application/middleware/context';
import { SESSION_NAME } from '@/common/constants/session';

export default async function logout(c: Context<Env>) {
  const sessionId = c.get(CONTEXT_KEY.SESSION_ID);
  const rdb = getRdbClient(c.env.DATABASE_URL);
  const service = new AccountService(new AccountRepositoryImpl(rdb), new UserRepositoryImpl(rdb));

  const result = await service.logout(sessionId);

  return result.match(
    () => {
      deleteCookie(c, SESSION_NAME);
      logger.info('logout success');
      return c.body(null, 204);
    },
    (error) => {
      if (error instanceof NotFoundError) {
        throw new HTTPException(error.statusCode as ContentfulStatusCode, {
          message: error.message,
        });
      }

      logger.error(error instanceof ServerError ? 'internal server error' : 'unknown error', error);
      throw new HTTPException(500, { message: 'Internal server error' });
    },
  );
}
