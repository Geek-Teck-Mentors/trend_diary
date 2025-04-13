import { createMiddleware } from 'hono/factory';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/logger/logger';
import CONTEXT_KEY from './context';

const loggerMiddleware = createMiddleware(async (c, next) => {
  const requestId = uuidv4();
  const startTime = performance.now();

  const { method } = c.req;
  const { path } = c.req;
  const userAgent = c.req.header('user-agent');

  const requestLogger = logger.with({
    request_id: requestId,
    method,
    path,
    user_agent: userAgent,
  });

  const appLogger = logger.with({
    request_id: requestId,
  });

  requestLogger.info('Request started');

  c.set(CONTEXT_KEY.APP_LOG, appLogger);
  await next();

  const responseTime = Math.round(performance.now() - startTime);
  requestLogger.info('Request completed', {
    status: c.res.status,
    response_time: responseTime,
  });
});

export default loggerMiddleware;
