import { HTTPException } from 'hono/http-exception';
import { LoggerType } from '@/logger/logger';
import ClientError from './clientError';
import ServerError from './serverError';

export default function handleError(error: unknown, logger: LoggerType): HTTPException {
  if (error instanceof ClientError) {
    logger.warn('client error in search', error);
    return new HTTPException(400, {
      message: error.message,
    });
  }

  if (error instanceof ServerError) {
    logger.error('internal server error', error);
    return new HTTPException(500, {
      message: error.message,
    });
  }

  logger.error('unknown error', error);
  return new HTTPException(500, {
    message: 'unknown error',
  });
}
