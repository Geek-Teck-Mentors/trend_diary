import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { AlreadyExistsError, ServerError } from '@/common/errors';
import getRdbClient from '@/infrastructure/rdb';

import AccountRepositoryImpl from '@/domain/account/infrastructure/accountRepository';
import { accountSchema } from '@/domain/account/schema/accountSchema';
import AccountService from '@/domain/account/service/accountService';
import { logger } from '@/logger/logger';
import { Env } from '@/application/env';
import UserRepositoryImpl from '@/domain/account/infrastructure/userRepository';

export default async function signup(c: Context<Env>) {
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
  const service = new AccountService(new AccountRepositoryImpl(rdb), new UserRepositoryImpl(rdb));

  try {
    const account = await service.signup(valid.data.email, valid.data.password);
    logger.info('sign up success', { accountId: account.accountId.toString() });

    return c.json({}, 201);
  } catch (error) {
    if (error instanceof AlreadyExistsError) {
      throw new HTTPException(409, {
        message: error.message,
      });
    }

    if (error instanceof ServerError) {
      logger.error('internal server error', error);
      throw new HTTPException(500, {
        message: error.message,
      });
    }

    logger.error('unknown error', error);
    throw new HTTPException(500, {
      message: 'unknown error',
    });
  }
}
