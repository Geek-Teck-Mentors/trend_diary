import { logger } from "./logger/logger";
import { CONTEXT_KEY } from "./middleware/context";

export type Env = {
  Variables: {
    [CONTEXT_KEY.APP_LOG]: typeof logger;
  };
};
