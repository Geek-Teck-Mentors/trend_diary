import { HTTPException } from 'hono/http-exception';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { ClientError, ServerError } from '@/common/errors';
import {
  AccountService,
  UserRepositoryImpl,
  AccountRepositoryImpl,
  AccountInput,
} from '@/domain/account';
import { logger } from '@/logger/logger';
import getRdbClient, { Transaction } from '@/infrastructure/rdb';
import { ZodValidatedContext } from '@/application/middleware/zodValidator';

export default async function login(c: ZodValidatedContext<AccountInput>) {
  const valid = c.req.valid('json');

  const rdb = getRdbClient(c.env.DATABASE_URL);
  const accountRepository = new AccountRepositoryImpl(rdb);
  const userRepository = new UserRepositoryImpl(rdb);
  const transaction = new Transaction(rdb);
  const service = new AccountService(accountRepository, userRepository, transaction);

  const result = await service.login(valid.email, valid.password);

  return result.match(
    (user) => {
      logger.info('login success', { userId: user.userId.toString() });
      return c.json(
        {
          displayName: user.displayName,
        },
        200,
      );
    },
    (error) => {
      if (error instanceof ClientError) {
        throw new HTTPException(error.statusCode as ContentfulStatusCode, {
          message: error.message,
        });
      }
      logger.error(error instanceof ServerError ? 'internal server error' : 'unknown error', error);
      throw new HTTPException(500, { message: 'Internal server error' });
    },
  );
}
