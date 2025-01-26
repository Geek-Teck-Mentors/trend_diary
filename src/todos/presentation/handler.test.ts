import app from "../..";

describe("Example Todos", () => {
  test("GET /api/todos", async () => {
    const res = await app.request("/api/todos");
    expect(res.status).toBe(200);
  });
});
