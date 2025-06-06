import { ZodSchema } from 'zod';
import type { Context, ValidationTargets } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { Env } from '../env';

// 参考: https://github.com/honojs/middleware/blob/main/packages/zod-validator/README.md
const zodValidator = <Target extends keyof ValidationTargets, T extends ZodSchema>(
  target: Target,
  schema: T,
) =>
  zValidator(target, schema, (result) => {
    if (!result.success) {
      const errorMessages = result.error.flatten().fieldErrors;
      throw new HTTPException(422, {
        message: 'Invalid input',
        cause: errorMessages,
      });
    }
  });

export default zodValidator;

// zodValidatorの型は自動推論が厳しかったため、何度も書きそうなベタガキを共通化
export type ZodValidatedContext<T, P extends string = ''> = Context<
  Env,
  P,
  {
    in: {
      json: T;
    };
    out: {
      json: T;
    };
  }
>;
