import { Hono } from "hono";
import adminApp from "@/application/api/admin/route";
import articleApp from "@/application/api/article/route";
import authApp from "@/application/api/auth/route";
import policyApp from "@/application/api/policy/route";
import userApp from "@/application/api/user/route";

const app = new Hono()
	.route("/auth", authApp)
	.route("/user", userApp)
	.route("/articles", articleApp)
	.route("/policies", policyApp)
	.route("/admin", adminApp);

export default app;
