import { HTTPException } from "hono/http-exception";
import { CONTEXT_KEY } from "./context";
import { Context } from "hono";
import { Env } from "../env";

export const errorHandler = async (
  err: Error,
  c: Context<Env>
): Promise<Response> => {
  const logger = c.get(CONTEXT_KEY.APP_LOG);

  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  // 予期しないエラーの場合
  logger.error({
    msg: "Unhandled error",
    err, // * pinoのstdSerializersで処理されるよう、errプロパティ名を使用
  });

  return c.json("Internal Server Error", { status: 500 });
};
