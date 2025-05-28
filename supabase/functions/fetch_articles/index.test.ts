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
import { QiitaFetcher } from "./fetcher/qiita_fetcher.ts";
import { ZennFetcher } from "./fetcher/zenn_fetcher.ts";
import ArticleRepositoryImpl from "./repository.ts";
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
    await t.step("Qiitaの記事を取得できること", async () => {
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

      const res = await sendRequest("POST", "/fetch_articles/articles/qiita");

      assertEquals(res.status, 201);
      const jsonRes = await res.json();
      assertEquals(jsonRes.message, "Articles fetched successfully: 2");

      assertSpyCalls(fetcherStub, 1);

      fetcherStub.restore();
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

      const res = await sendRequest("POST", "/fetch_articles/articles/qiita");

      assertEquals(res.status, 500);
      const jsonRes = await res.json();
      assertEquals(jsonRes.message, "internal server error");

      fetcherStub.restore();
      repositoryStub.restore();
    });
  });

  await t.step("異常系", async (t) => {
    await t.step(
      "Qiitaの記事の取得でエラーが発生した場合、500エラーを返すこと",
      async () => {
        const fetcherStub = stub(QiitaFetcher.prototype, "fetch", () => {
          throw new MediaFetchError("Failed to fetch Qiita articles");
        });

        const res = await sendRequest("POST", "/fetch_articles/articles/qiita");

        assertEquals(res.status, 500);
        const jsonRes = await res.json();
        assertEquals(jsonRes.message, "internal server error");

        fetcherStub.restore();
      },
    );
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

      const res = await sendRequest("POST", "/fetch_articles/articles/zenn");

      assertEquals(res.status, 500);
      const jsonRes = await res.json();
      assertEquals(jsonRes.message, "internal server error");

      fetcherStub.restore();
      repositoryStub.restore();
    });
    await t.step(
      "予期せぬエラーが発生した場合、500エラーを返すこと",
      async () => {
        const executorStub = stub(Executor.prototype, "do", () => {
          throw new Error();
        });
        const res = await sendRequest("POST", "/fetch_articles/articles/qiita");

        assertEquals(res.status, 500);
        const jsonRes = await res.json();
        assertEquals(jsonRes.message, "unknown error");

        executorStub.restore();
      },
    );
  });
});

Deno.test("POST /fetch_articles/articles/zenn", async (t) => {
  await t.step("正常系", async (t) => {
    await t.step("Zennの記事を取得できること", async () => {
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

      const res = await sendRequest("POST", "/fetch_articles/articles/zenn");

      assertEquals(res.status, 201);
      const jsonRes = await res.json();
      assertEquals(jsonRes.message, "Articles fetched successfully: 2");

      assertSpyCalls(fetcherStub, 1);

      fetcherStub.restore();
    });
  });

  await t.step("異常系", async (t) => {
    await t.step(
      "Zennの記事のでエラーが発生した場合、500エラーを返すこと",
      async () => {
        const fetcherStub = stub(ZennFetcher.prototype, "fetch", () => {
          throw new MediaFetchError("Failed to fetch Zenn articles");
        });

        const res = await sendRequest("POST", "/fetch_articles/articles/zenn");

        assertEquals(res.status, 500);
        const jsonRes = await res.json();
        assertEquals(jsonRes.message, "internal server error");

        fetcherStub.restore();
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

      const res = await sendRequest("POST", "/fetch_articles/articles/zenn");

      assertEquals(res.status, 500);
      const jsonRes = await res.json();
      assertEquals(jsonRes.message, "internal server error");

      fetcherStub.restore();
      repositoryStub.restore();
    });

    await t.step(
      "予期せぬエラーが発生した場合、500エラーを返すこと",
      async () => {
        const executorStub = stub(Executor.prototype, "do", () => {
          throw new Error();
        });
        const res = await sendRequest("POST", "/fetch_articles/articles/zenn");

        assertEquals(res.status, 500);
        const jsonRes = await res.json();
        assertEquals(jsonRes.message, "unknown error");

        executorStub.restore();
      },
    );
  });
});
