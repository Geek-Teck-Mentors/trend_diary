import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { Env } from '../env';
import CONTEXT_KEY from './context';
import getRdbClient from '@/infrastructure/rdb';
import { AccountRepositoryImpl, AccountService, UserRepositoryImpl } from '@/domain/account';
import { NotFoundError } from '@/common/errors';
import { SESSION_NAME } from '@/common/constants/session';

const authenticator = createMiddleware<Env>(async (c, next) => {
  const logger = c.get(CONTEXT_KEY.APP_LOG);

  const sessionId = getCookie(c, SESSION_NAME);
  if (!sessionId) throw new HTTPException(401, { message: 'login required' });

  // SQLインジェクション対策
  const valid = z.string().uuid().safeParse(sessionId);
  if (!valid.success) {
    logger.warn('invalid sid format', { sessionId });
    throw new HTTPException(401, { message: 'login required' });
  }

  const rdb = getRdbClient(c.env.DATABASE_URL);
  const service = new AccountService(new AccountRepositoryImpl(rdb), new UserRepositoryImpl(rdb));

  const result = await service.getLoginUser(sessionId);

  result.match(
    (user) => {
      c.set(CONTEXT_KEY.SESSION_USER, user);
      c.set(CONTEXT_KEY.SESSION_ID, sessionId);
      return next();
    },
    (error) => {
      if (error instanceof NotFoundError) {
        logger.error('Session not found', { sessionId });
        throw new HTTPException(401, { message: 'login required' });
      }
      logger.error('Error occurred while authenticating', { error });
      throw new HTTPException(500, { message: 'Internal Server Error' });
    },
  );
});

export default authenticator;
