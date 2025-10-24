import { Hono } from "hono";
import type { Env } from "@/application/env";
import zodValidator from "@/application/middleware/zodValidator";
import { authInputSchema } from "@/domain/auth/schema/authInput";
import signup from "./signup";
import login from "./login";
import logout from "./logout";

const app = new Hono<Env>()
	.post("/signup", zodValidator("json", authInputSchema), signup)
	.post("/login", zodValidator("json", authInputSchema), login)
	.post("/logout", logout);

export default app;
