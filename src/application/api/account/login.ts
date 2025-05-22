import { HTTPException } from 'hono/http-exception';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { setCookie } from 'hono/cookie';
import { ClientError, ServerError } from '@/common/errors';
import {
  AccountService,
  UserRepositoryImpl,
  AccountRepositoryImpl,
  AccountInput,
} from '@/domain/account';
import { logger } from '@/logger/logger';
import getRdbClient from '@/infrastructure/rdb';
import { ZodValidatedContext } from '@/application/middleware/zodValidator';
import { SESSION_NAME } from '@/common/constants/session';

export default async function login(c: ZodValidatedContext<AccountInput>) {
  const valid = c.req.valid('json');

  const rdb = getRdbClient(c.env.DATABASE_URL);
  const service = new AccountService(new AccountRepositoryImpl(rdb), new UserRepositoryImpl(rdb));

  try {
    const result = await service.login(valid.email, valid.password);
    logger.info('login success', { userId: result.user.userId.toString() });

    // セッションIDをCookieにセット
    setCookie(c, SESSION_NAME, result.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: result.expiredAt,
      sameSite: 'lax',
    });

    return c.json(
      {
        displayName: result.user.displayName,
      },
      200,
    );
  } catch (error) {
    if (error instanceof ClientError) {
      throw new HTTPException(error.statusCode as ContentfulStatusCode, { message: error.message });
    }

    logger.error(error instanceof ServerError ? 'internal server error' : 'unknown error', error);
    throw new HTTPException(500, { message: 'Internal server error' });
  }
}
