import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { AlreadyExistsError, ServerError } from '@/common/errors';
import getRdbClient, { Transaction } from '@/infrastructure/rdb';

import { accountSchema } from '@/domain/account/schema/accountSchema';
import { Env } from '@/application/env';
import { AccountRepositoryImpl, AccountService, UserRepositoryImpl } from '@/domain/account';
import { isError } from '@/common/types/utility';
import CONTEXT_KEY from '@/application/middleware/context';

export default async function signup(c: Context<Env>) {
  const logger = c.get(CONTEXT_KEY.APP_LOG);
  let body;
  try {
    body = await c.req.json();
  } catch (error) {
    throw new HTTPException(400, {
      message: 'Invalid JSON',
    });
  }

  const valid = accountSchema
    .pick({
      email: true,
      password: true,
    })
    .safeParse({
      email: body.email,
      password: body.password,
    });
  if (!valid.success) {
    const errorMessages = valid.error.flatten().fieldErrors;
    throw new HTTPException(422, {
      message: 'Invalid input',
      cause: errorMessages,
    });
  }

  const rdb = getRdbClient(c.env.DATABASE_URL);
  const accountRepository = new AccountRepositoryImpl(rdb);
  const userRepository = new UserRepositoryImpl(rdb);
  const transaction = new Transaction(rdb);
  const service = new AccountService(accountRepository, userRepository);

  const result = await service.signup(transaction, valid.data.email, valid.data.password);
  if (isError(result)) {
    const e = result.error;
    if (e instanceof AlreadyExistsError) {
      throw new HTTPException(409, {
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

  const account = result.data;
  logger.info('sign up success', { accountId: account.accountId.toString() });
  return c.json({}, 201);
}
