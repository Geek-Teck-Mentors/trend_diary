import { logger } from '@/logger/logger';
import CONTEXT_KEY from '../middleware/context';

export type Env = {
  Bindings: {
    DATABASE_URL: string;
  };
  Variables: {
    [CONTEXT_KEY.APP_LOG]: typeof logger;
  };
};
