import TEST_ENV from "@/test/env";
import app from "@/application/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
	datasourceUrl: TEST_ENV.DATABASE_URL,
});

describe("POST /api/auth/login", () => {
	const testEmail = "login@test.com";
	const testPassword = "test_password";

	beforeAll(async () => {
		await prisma.user.deleteMany({});

		// テストユーザーを作成
		await app.request(
			"/api/auth/signup",
			{
				method: "POST",
				body: JSON.stringify({ email: testEmail, password: testPassword }),
				headers: {
					"Content-Type": "application/json",
				},
			},
			TEST_ENV,
		);
	});

	afterAll(async () => {
		await prisma.user.deleteMany({});
		await prisma.$disconnect();
	});

	async function requestLogin(body: string) {
		return app.request(
			"/api/auth/login",
			{
				method: "POST",
				body,
				headers: {
					"Content-Type": "application/json",
				},
			},
			TEST_ENV,
		);
	}

	it("正常系: ログインができる", async () => {
		const res = await requestLogin(
			JSON.stringify({ email: testEmail, password: testPassword }),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toHaveProperty("accessToken");
		expect(body).toHaveProperty("refreshToken");

		// Set-Cookieヘッダーでトークンが設定されることを確認
		const cookies = res.headers.get("Set-Cookie");
		expect(cookies).toBeDefined();
	});

	describe("準正常系", () => {
		it("存在しないユーザー", async () => {
			const res = await requestLogin(
				JSON.stringify({
					email: "notexist@test.com",
					password: testPassword,
				}),
			);

			expect(res.status).toBe(401);
		});

		it("パスワードが間違っている", async () => {
			const res = await requestLogin(
				JSON.stringify({ email: testEmail, password: "wrong_password" }),
			);

			expect(res.status).toBe(401);
		});
	});
});
