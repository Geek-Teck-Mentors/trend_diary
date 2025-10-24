import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthRepositoryImpl } from "./authRepositoryImpl";
import type { AuthSupabaseClient } from "./supabaseClient";
import { isSuccess, isError } from "@/common/types/utility";

describe("AuthRepositoryImpl", () => {
	let supabaseClient: AuthSupabaseClient;
	let repository: AuthRepositoryImpl;

	beforeEach(() => {
		supabaseClient = {
			auth: {
				signUp: vi.fn(),
				signInWithPassword: vi.fn(),
				signOut: vi.fn(),
				getUser: vi.fn(),
			},
		} as any;
		repository = new AuthRepositoryImpl(supabaseClient);
	});

	describe("signUp", () => {
		it("ユーザーを作成できる", async () => {
			const email = "test@example.com";
			const password = "password123";
			const supabaseId = "123e4567-e89b-12d3-a456-426614174000";

			vi.mocked(supabaseClient.auth.signUp).mockResolvedValue({
				data: {
					user: {
						id: supabaseId,
						email,
					},
				},
				error: null,
			} as any);

			const result = await repository.signUp(email, password);

			expect(isSuccess(result)).toBe(true);
			if (isSuccess(result)) {
				expect(result.data.id).toBe(supabaseId);
				expect(result.data.email).toBe(email);
			}
		});

		it("Supabase Authエラー時はエラーを返す", async () => {
			const email = "test@example.com";
			const password = "password123";

			vi.mocked(supabaseClient.auth.signUp).mockResolvedValue({
				data: { user: null },
				error: { message: "User already registered" },
			} as any);

			const result = await repository.signUp(email, password);

			expect(isError(result)).toBe(true);
			if (isError(result)) {
				expect(result.error.message).toBe("User already registered");
			}
		});
	});

	describe("signIn", () => {
		it("ログインできる", async () => {
			const email = "test@example.com";
			const password = "password123";
			const supabaseId = "123e4567-e89b-12d3-a456-426614174000";

			vi.mocked(supabaseClient.auth.signInWithPassword).mockResolvedValue({
				data: {
					user: {
						id: supabaseId,
						email,
					},
					session: {
						access_token: "access123",
						refresh_token: "refresh123",
						expires_at: 1234567890,
					},
				},
				error: null,
			} as any);

			const result = await repository.signIn(email, password);

			expect(isSuccess(result)).toBe(true);
			if (isSuccess(result)) {
				expect(result.data.accessToken).toBe("access123");
				expect(result.data.user.id).toBe(supabaseId);
			}
		});

		it("認証エラー時はエラーを返す", async () => {
			const email = "test@example.com";
			const password = "wrong_password";

			vi.mocked(supabaseClient.auth.signInWithPassword).mockResolvedValue({
				data: { user: null, session: null },
				error: { message: "Invalid login credentials" },
			} as any);

			const result = await repository.signIn(email, password);

			expect(isError(result)).toBe(true);
			if (isError(result)) {
				expect(result.error.message).toBe("Invalid login credentials");
			}
		});
	});

	describe("signOut", () => {
		it("ログアウトできる", async () => {
			vi.mocked(supabaseClient.auth.signOut).mockResolvedValue({
				error: null,
			} as any);

			const result = await repository.signOut();

			expect(isSuccess(result)).toBe(true);
		});

		it("エラー時はエラーを返す", async () => {
			vi.mocked(supabaseClient.auth.signOut).mockResolvedValue({
				error: { message: "Logout failed" },
			} as any);

			const result = await repository.signOut();

			expect(isError(result)).toBe(true);
			if (isError(result)) {
				expect(result.error.message).toBe("Logout failed");
			}
		});
	});

	describe("getUser", () => {
		it("アクセストークンからユーザー情報を取得できる", async () => {
			const accessToken = "access123";
			const supabaseId = "123e4567-e89b-12d3-a456-426614174000";

			vi.mocked(supabaseClient.auth.getUser).mockResolvedValue({
				data: {
					user: {
						id: supabaseId,
						email: "test@example.com",
					},
				},
				error: null,
			} as any);

			const result = await repository.getUser(accessToken);

			expect(isSuccess(result)).toBe(true);
			if (isSuccess(result)) {
				expect(result.data.id).toBe(supabaseId);
			}
		});

		it("トークンが無効な場合はエラーを返す", async () => {
			const accessToken = "invalid_token";

			vi.mocked(supabaseClient.auth.getUser).mockResolvedValue({
				data: { user: null },
				error: { message: "Invalid token" },
			} as any);

			const result = await repository.getUser(accessToken);

			expect(isError(result)).toBe(true);
			if (isError(result)) {
				expect(result.error.message).toBe("Invalid token");
			}
		});
	});
});
