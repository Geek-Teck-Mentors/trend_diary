import CONTEXT_KEY from "@/application/middleware/context";
import type { ZodValidatedContext } from "@/application/middleware/zodValidator";
import { handleError } from "@/common/errors";
import { isError } from "@/common/types/utility";
import type { AuthInput } from "@/domain/auth/schema/authInput";
import { createAuthUseCase } from "@/domain/auth/useCase";
import { UserCommandRepositoryImpl } from "@/domain/user/infrastructure/commandImpl";
import { createAuthClient } from "@/infrastructure/auth/supabaseClient";
import { AuthRepositoryImpl } from "@/infrastructure/auth/authRepositoryImpl";
import getRdbClient from "@/infrastructure/rdb";
import { setCookie } from "hono/cookie";

export default async function login(c: ZodValidatedContext<AuthInput>) {
	const logger = c.get(CONTEXT_KEY.APP_LOG);
	const valid = c.req.valid("json");

	// Supabase Authクライアント作成
	const supabaseClient = createAuthClient(
		c.env.SUPABASE_URL,
		c.env.SUPABASE_ANON_KEY,
	);

	// リポジトリとユースケース作成
	const authRepository = new AuthRepositoryImpl(supabaseClient);
	const rdb = getRdbClient(c.env.DATABASE_URL);
	const userCommandRepository = new UserCommandRepositoryImpl(rdb);
	const useCase = createAuthUseCase(authRepository, userCommandRepository);

	// ログイン
	const result = await useCase.signIn(valid.email, valid.password);
	if (isError(result)) throw handleError(result.error, logger);

	const session = result.data;

	// Cookieにトークンを設定
	setCookie(c, "sb-access-token", session.accessToken, {
		httpOnly: true,
		secure: true,
		sameSite: "Lax",
		maxAge: session.expiresAt - Math.floor(Date.now() / 1000),
		path: "/",
	});

	setCookie(c, "sb-refresh-token", session.refreshToken, {
		httpOnly: true,
		secure: true,
		sameSite: "Lax",
		maxAge: 60 * 60 * 24 * 7, // 7日間
		path: "/",
	});

	logger.info("login success", { userId: session.user.id });
	return c.json({
		accessToken: session.accessToken,
		refreshToken: session.refreshToken,
	});
}
