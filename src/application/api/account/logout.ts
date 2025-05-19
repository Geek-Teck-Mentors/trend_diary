import { getCookie, deleteCookie } from 'hono/cookie';
import { Context } from 'hono';
import { Env } from '@/application/env';
import { NotFoundError } from '@/common/errors';
import { AccountRepositoryImpl, AccountService, UserRepositoryImpl } from '@/domain/account';
import getRdbClient from '@/infrastructure/rdb';
import { logger } from '@/logger/logger';

export default async function logout(c: Context<Env>) {
  // セッションIDをCookieから取得
  const sessionId = getCookie(c, 'sid');

  if (!sessionId) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  try {
    const rdb = getRdbClient(c.env.DATABASE_URL);
    const service = new AccountService(new AccountRepositoryImpl(rdb), new UserRepositoryImpl(rdb));

    await service.logout(sessionId);

    deleteCookie(c, 'sid');

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
