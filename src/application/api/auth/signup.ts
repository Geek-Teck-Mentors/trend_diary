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

export default async function signup(c: ZodValidatedContext<AuthInput>) {
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

	// ユーザー登録
	const result = await useCase.signUp(valid.email, valid.password);
	if (isError(result)) throw handleError(result.error, logger);

	const user = result.data;
	logger.info("sign up success", { userId: user.userId.toString() });
	return c.json(
		{ userId: user.userId.toString(), supabaseId: user.supabaseId },
		201,
	);
}
