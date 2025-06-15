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
import getRdbClient from '@/infrastructure/rdb';
import { ZodValidatedContext } from '@/application/middleware/zodValidator';
import { SESSION_NAME } from '@/common/constants/session';
import { isSuccess, isError } from '@/common/types/utility';
import CONTEXT_KEY from '@/application/middleware/context';

export default async function login(c: ZodValidatedContext<AccountInput>) {
  const valid = c.req.valid('json');
  const logger = c.get(CONTEXT_KEY.APP_LOG);

  const rdb = getRdbClient(c.env.DATABASE_URL);
  const accountRepository = new AccountRepositoryImpl(rdb);
  const userRepository = new UserRepositoryImpl(rdb);
  const service = new AccountService(accountRepository, userRepository);

  const result = await service.login(valid.email, valid.password);

  if (isSuccess(result)) {
    const res = result.data;
    logger.info('login success', { userId: res.user.userId.toString() });

    // セッションIDをCookieにセット
    setCookie(c, SESSION_NAME, res.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: res.expiredAt,
      sameSite: 'lax',
    });

    return c.json(
      {
        displayName: res.user.displayName,
      },
      200,
    );
  }

  if (isError(result)) {
    const { error } = result;
    if (error instanceof ClientError) {
      throw new HTTPException(error.statusCode as ContentfulStatusCode, {
        message: error.message,
      });
    }
    logger.error(error instanceof ServerError ? 'internal server error' : 'unknown error', error);
    throw new HTTPException(500, { message: 'Internal server error' });
  }
}
