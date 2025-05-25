// deno環境であることを明示するためのコメント
/// <reference lib="deno.ns" />

import { assertEquals } from "https://deno.land/std@0.83.0/testing/asserts.ts";
import {
  assertSpyCallArgs,
  assertSpyCalls,
  stub,
} from "https://deno.land/std@0.152.0/testing/mock.ts";
import { app } from "./index.ts";
import { Executor } from "./executor.ts";
import { Article } from "./model/model.ts";
import { logger } from "../../logger/logger.ts";
import { QiitaFetcher } from "./fetcher/qiita_fetcher.ts";
import { ZennFetcher } from "./fetcher/zenn_fetcher.ts";
import ArticleRepositoryImpl from "./repository/index.ts";
import { DatabaseError, MediaFetchError } from "./error.ts";

// テストヘルパー関数
async function sendRequest(method: string, path: string, body?: unknown) {
  const req = new Request(`http://localhost${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return await app.fetch(req);
}

// 正常系のモック記事データ
const mockArticles: Article[] = [
  new Article(
    1n,
    "media",
    "title",
    "author",
    "content",
    "https://article1.example.com",
    new Date(),
  ),
  new Article(
    2n,
    "media",
    "title",
    "author",
    "content",
    "https://article1.example.com",
    new Date(),
  ),
  new Article(
    3n,
    "media",
    "title",
    "author",
    "content",
    "https://article1.example.com",
    new Date(),
  ),
];

Deno.test("POST /fetch_articles/articles/qiita", async (t) => {
  await t.step("正常系", async (t) => {
    await t.step("Qiitaの記事を正常に取得できること", async () => {
      const fetcherStub = stub(
        QiitaFetcher.prototype,
        "fetch",
        () =>
          Promise.resolve([
            {
              title: "title 1",
              author: "author",
              description: "content",
              url: "https://article1.example.com",
            },
            {
              title: "title 2",
              author: "author",
              description: "content",
              url: "https://article2.example.com",
            },
          ]),
      );

      const repositoryStub = stub(
        ArticleRepositoryImpl.prototype,
        "bulkCreateArticle",
        () => Promise.resolve(mockArticles.slice(0, 2)),
      );

      const loggerStub = stub(logger, "info");

      const res = await sendRequest("POST", "/fetch_articles/articles/qiita");

      assertEquals(res.status, 201);
      const jsonRes = await res.json();
      assertEquals(jsonRes.message, "Articles fetched successfully: 2");

      assertSpyCalls(fetcherStub, 1);
      assertSpyCalls(repositoryStub, 1);
      assertSpyCalls(loggerStub, 1); // ログが1回呼ばれることを確認

      fetcherStub.restore();
      repositoryStub.restore();
      loggerStub.restore();
    });

    await t.step("DBエラーが発生した場合、500エラーを返すこと", async () => {
      const fetcherStub = stub(
        QiitaFetcher.prototype,
        "fetch",
        () =>
          Promise.resolve([
            {
              title: "title 1",
              author: "author",
              description: "content",
              url: "https://article1.example.com",
            },
          ]),
      );

      const repositoryStub = stub(
        ArticleRepositoryImpl.prototype,
        "bulkCreateArticle",
        () => {
          throw new DatabaseError("Failed to save to database");
        },
      );

      const loggerErrorStub = stub(logger, "error");

      const res = await sendRequest("POST", "/fetch_articles/articles/qiita");

      assertEquals(res.status, 500);
      const jsonRes = await res.json();
      assertEquals(jsonRes.message, "internal server error");

      assertSpyCalls(loggerErrorStub, 1);
      assertSpyCallArgs(loggerErrorStub, 0, [
        "DatabaseError",
        "Failed to save to database",
      ]);

      fetcherStub.restore();
      repositoryStub.restore();
      loggerErrorStub.restore();
    });
  });

  await t.step("準正常系", async (t) => {
    await t.step(
      "Qiitaの記事の取得でエラーが発生した場合、500エラーを返すこと",
      async () => {
        const fetcherStub = stub(QiitaFetcher.prototype, "fetch", () => {
          throw new MediaFetchError("Failed to fetch Qiita articles");
        });

        const loggerErrorStub = stub(logger, "error");

        const res = await sendRequest("POST", "/fetch_articles/articles/qiita");

        assertEquals(res.status, 500);
        const jsonRes = await res.json();
        assertEquals(jsonRes.message, "internal server error");

        assertSpyCalls(loggerErrorStub, 1);
        assertSpyCallArgs(loggerErrorStub, 0, [
          "MediaFetchError",
          "Failed to fetch Qiita articles",
        ]);

        fetcherStub.restore();
        loggerErrorStub.restore();
      },
    );
  });

  await t.step("異常系", async (t) => {
    await t.step(
      "予期せぬエラーが発生した場合、500エラーを返すこと",
      async () => {
        const executorStub = stub(Executor.prototype, "do", () => {
          throw new Error();
        });
        const loggerErrorStub = stub(logger, "error");

        const res = await sendRequest("POST", "/fetch_articles/articles/qiita");

        assertEquals(res.status, 500);
        const jsonRes = await res.json();
        assertEquals(jsonRes.message, "unknown error");

        assertSpyCalls(loggerErrorStub, 1);

        executorStub.restore();
        loggerErrorStub.restore();
      },
    );
  });
});

Deno.test("POST /fetch_articles/articles/zenn", async (t) => {
  await t.step("正常系", async (t) => {
    await t.step("Zennの記事を正常に取得できること", async () => {
      const fetcherStub = stub(
        ZennFetcher.prototype,
        "fetch",
        () =>
          Promise.resolve([
            {
              title: "title 1",
              author: "author",
              description: "content",
              url: "https://article1.example.com",
            },
            {
              title: "title 2",
              author: "author",
              description: "content",
              url: "https://article2.example.com",
            },
          ]),
      );

      const repositoryStub = stub(
        ArticleRepositoryImpl.prototype,
        "bulkCreateArticle",
        () => Promise.resolve(mockArticles.slice(0, 2)),
      );

      const loggerStub = stub(logger, "info");

      const res = await sendRequest("POST", "/fetch_articles/articles/zenn");

      assertEquals(res.status, 201);
      const jsonRes = await res.json();
      assertEquals(jsonRes.message, "Articles fetched successfully: 2");

      assertSpyCalls(fetcherStub, 1);
      assertSpyCalls(repositoryStub, 1);
      assertSpyCalls(loggerStub, 1); // ログが1回呼ばれることを確認

      fetcherStub.restore();
      repositoryStub.restore();
      loggerStub.restore();
    });
  });

  await t.step("凖正常系", async (t) => {
    await t.step(
      "Zennの記事のでエラーが発生した場合、500エラーを返すこと",
      async () => {
        const fetcherStub = stub(ZennFetcher.prototype, "fetch", () => {
          throw new MediaFetchError("Failed to fetch Zenn articles");
        });

        const loggerErrorStub = stub(logger, "error");

        const res = await sendRequest("POST", "/fetch_articles/articles/zenn");

        assertEquals(res.status, 500);
        const jsonRes = await res.json();
        assertEquals(jsonRes.message, "internal server error");

        assertSpyCalls(loggerErrorStub, 1);
        assertSpyCallArgs(loggerErrorStub, 0, [
          "MediaFetchError",
          "Failed to fetch Zenn articles",
        ]);

        fetcherStub.restore();
        loggerErrorStub.restore();
      },
    );

    await t.step("DBエラーが発生した場合、500エラーを返すこと", async () => {
      const fetcherStub = stub(
        ZennFetcher.prototype,
        "fetch",
        () =>
          Promise.resolve([
            {
              title: "title 1",
              author: "author",
              description: "content",
              url: "https://article1.example.com",
            },
          ]),
      );
      const repositoryStub = stub(
        ArticleRepositoryImpl.prototype,
        "bulkCreateArticle",
        () => {
          throw new DatabaseError("Failed to save to database");
        },
      );

      const loggerErrorStub = stub(logger, "error");

      const res = await sendRequest("POST", "/fetch_articles/articles/zenn");

      assertEquals(res.status, 500);
      const jsonRes = await res.json();
      assertEquals(jsonRes.message, "internal server error");

      assertSpyCalls(loggerErrorStub, 1);
      assertSpyCallArgs(loggerErrorStub, 0, [
        "DatabaseError",
        "Failed to save to database",
      ]);

      fetcherStub.restore();
      repositoryStub.restore();
      loggerErrorStub.restore();
    });
  });

  await t.step("異常系", async (t) => {
    await t.step(
      "予期せぬエラーが発生した場合、500エラーを返すこと",
      async () => {
        const executorStub = stub(Executor.prototype, "do", () => {
          throw new Error();
        });
        const loggerErrorStub = stub(logger, "error");

        const res = await sendRequest("POST", "/fetch_articles/articles/zenn");

        assertEquals(res.status, 500);
        const jsonRes = await res.json();
        assertEquals(jsonRes.message, "unknown error");

        assertSpyCalls(loggerErrorStub, 1);

        executorStub.restore();
        loggerErrorStub.restore();
      },
    );
  });
});

Deno.test("API - 存在しないエンドポイントは404を返すこと", async () => {
  const res = await sendRequest("POST", "/fetch_articles/articles/unknown");

  assertEquals(res.status, 404);
});
