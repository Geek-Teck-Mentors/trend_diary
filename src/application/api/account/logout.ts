import { deleteCookie } from 'hono/cookie';
import { Context } from 'hono';
import { Env } from '@/application/env';
import { NotFoundError } from '@/common/errors';
import { AccountRepositoryImpl, AccountService, UserRepositoryImpl } from '@/domain/account';
import getRdbClient from '@/infrastructure/rdb';
import { logger } from '@/logger/logger';
import CONTEXT_KEY from '@/application/middleware/context';
import { SESSION_NAME } from '@/common/constants/session';

export default async function logout(c: Context<Env>) {
  const sessionId = c.get(CONTEXT_KEY.SESSION_ID);

  try {
    const rdb = getRdbClient(c.env.DATABASE_URL);
    const service = new AccountService(new AccountRepositoryImpl(rdb), new UserRepositoryImpl(rdb));

    await service.logout(sessionId);

    deleteCookie(c, SESSION_NAME);

    logger.info('logout success');
    return c.body(null, 204);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json({ message: 'Account not found' }, 404);
    }
    logger.error('logout error', error);
    throw error;
  }
}
