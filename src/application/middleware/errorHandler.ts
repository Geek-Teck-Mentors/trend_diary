import { HTTPException } from 'hono/http-exception';
import { Context } from 'hono';
import CONTEXT_KEY from './context';
import { Env } from '../env';

const errorHandler = async (err: Error, c: Context<Env>): Promise<Response> => {
  const logger = c.get(CONTEXT_KEY.APP_LOG);

  if (err instanceof HTTPException) {
    return c.json(
      {
        message: err.message,
      },
      {
        status: err.status,
      },
    );
  }

  // 予期しないエラーの場合
  logger.error({
    msg: 'Unhandled error',
    err, // * pinoのstdSerializersで処理されるよう、errプロパティ名を使用
  });

  return c.json('Internal Server Error', { status: 500 });
};

export default errorHandler;
