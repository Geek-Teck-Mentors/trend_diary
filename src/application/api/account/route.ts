import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { resolver, validator } from 'hono-openapi/zod';
import signup from './signup';
import { accountSchema } from '@/domain/account';
import { Env } from '@/application/env';
import login from './login';
import logout from './logout';
import authenticator from '@/application/middleware/authenticator';
import loginUser from './loginUser';

const loginSchema = accountSchema.pick({ email: true, password: true });

const app = new Hono<Env>()
  .get(
    '/me',
    describeRoute({
      description: 'ログイン中のユーザー情報を取得',
      responses: {
        200: {
          description: 'ユーザー情報',
          content: {
            'application/json': {
              schema: resolver(accountSchema.pick({ accountId: true, email: true })),
            },
          },
        },
        401: {
          description: '認証が必要',
        },
      },
      security: [{ bearerAuth: [] }],
    }),
    authenticator,
    loginUser,
  )
  .post(
    '/',
    describeRoute({
      description: 'ユーザー登録',
      requestBody: {
        content: {
          'application/json': {
            schema: resolver(accountSchema),
          },
        },
      },
      responses: {
        201: {
          description: 'ユーザー登録成功',
        },
        400: {
          description: 'バリデーションエラー',
        },
      },
    }),
    signup,
  )
  .post(
    '/login',
    describeRoute({
      description: 'ユーザーログイン',
      requestBody: {
        content: {
          'application/json': {
            schema: resolver(loginSchema),
          },
        },
      },
      responses: {
        200: {
          description: 'ログイン成功',
        },
        401: {
          description: '認証失敗',
        },
      },
    }),
    validator('json', loginSchema),
    login,
  )
  .delete(
    '/logout',
    describeRoute({
      description: 'ユーザーログアウト',
      responses: {
        200: {
          description: 'ログアウト成功',
        },
        401: {
          description: '認証が必要',
        },
      },
      security: [{ bearerAuth: [] }],
    }),
    authenticator,
    logout,
  );

export default app;
