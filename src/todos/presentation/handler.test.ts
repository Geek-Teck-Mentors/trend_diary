import app from "../..";
import { isTodo } from "../schema";

// ? DBの場合は接続するURIの切り替えで実現する。今回は仮実装のため、モックのみ存在する。
describe("Example Todos", () => {
  test("GET /api/todos", async () => {
    const res = await app.request("/api/todos");
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json instanceof Array).toBe(true);
  });

  test("POST /api/todos", async () => {
    const res = await app.request("/api/todos", {
      method: "POST",
      body: JSON.stringify({ title: "test" }),
    });
    expect(res.status).toBe(200);
  });
});
