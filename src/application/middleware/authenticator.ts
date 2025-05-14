import { createMiddleware } from 'hono/factory';
import { getSignedCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import { Env } from '../env';
import CONTEXT_KEY from './context';
import getRdbClient from '@/infrastructure/rdb';
import { AccountRepositoryImpl, AccountService, UserRepositoryImpl } from '@/domain/account';
import { NotFoundError } from '@/common/errors';

const authenticator = createMiddleware<Env>(async (c, next) => {
  const logger = c.get(CONTEXT_KEY.APP_LOG);

  const sessionId = await getSignedCookie(c, c.env.SECRET_KEY, 'sid');
  if (!sessionId) throw new HTTPException(401, { message: 'login required' });

  const rdb = getRdbClient(c.env.DATABASE_URL);
  const service = new AccountService(new AccountRepositoryImpl(rdb), new UserRepositoryImpl(rdb));

  try {
    const user = await service.getLoginUser(sessionId);

    c.set(CONTEXT_KEY.SESSION_USER, user);
    await next();
  } catch (error) {
    if (error instanceof NotFoundError) {
      logger.error('Session not found', { sessionId });
      throw new HTTPException(401, { message: 'login required' });
    }
    if (error instanceof Error) {
      logger.error('Error occurred while authenticating', error);
      throw new HTTPException(500, { message: 'Internal Server Error' });
    }
    logger.error('Unknown error occurred', error);
    throw new HTTPException(500, { message: 'Internal Server Error' });
  }
});

export default authenticator;
