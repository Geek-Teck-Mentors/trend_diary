// deno環境であることを明示するためのコメント
/// <reference lib="deno.ns" />

import { assertEquals } from "https://deno.land/std@0.83.0/testing/asserts.ts";
import {
  assertSpyCalls,
  stub,
} from "https://deno.land/std@0.152.0/testing/mock.ts";
import { app } from "./index.ts";
import { ExecutorImpl } from "./executor.ts";
import { QiitaFetcher } from "./fetcher/qiita_fetcher.ts";
import { ZennFetcher } from "./fetcher/zenn_fetcher.ts";
import ArticleRepositoryImpl from "./repository.ts";
import { DatabaseError, MediaFetchError } from "./error.ts";
import { Article } from "./model/model.ts";
import { failure, success } from "@yuukihayashi0510/core";

import { describe, it } from "jsr:@std/testing/bdd";

import StubManager from "../../test/utils/stub_manager.ts";

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

describe("POST /fetch_articles/articles/qiita", () => {
  describe("正常系", () => {
    it("Qiitaの記事を取得できること", async () => {
      using stubManager = new StubManager();

      const fetcherStub = stubManager.addStub(stub(
        QiitaFetcher.prototype,
        "fetch",
        () =>
          Promise.resolve(success([
            {
              title: "title 1",
              author: "author",
              description: "content",
              url: "https://qiita.example.com/article1",
            },
            {
              title: "title 2",
              author: "author",
              description: "content",
              url: "https://qiita.example.com/article2",
            },
          ])),
      ));

      stubManager.addStub(stub(
        ArticleRepositoryImpl.prototype,
        "fetchArticlesByUrls",
        () => Promise.resolve(success([])),
      ));

      stubManager.addStub(stub(
        ArticleRepositoryImpl.prototype,
        "bulkCreateArticle",
        () =>
          Promise.resolve(success([
            new Article(
              BigInt(1),
              "qiita",
              "title 1",
              "author",
              "content",
              "https://qiita.example.com/article1",
              new Date(),
            ),
            new Article(
              BigInt(2),
              "qiita",
              "title 2",
              "author",
              "content",
              "https://qiita.example.com/article2",
              new Date(),
            ),
          ])),
      ));

      const res = await sendRequest("POST", "/fetch_articles/articles/qiita");

      assertEquals(res.status, 201);
      const jsonRes = await res.json();
      assertEquals(jsonRes.message, "Articles fetched successfully: 2");

      assertSpyCalls(fetcherStub, 1);
    });
  });

  describe("異常系", () => {
    it("Qiitaの記事の取得でエラーが発生した場合、500エラーを返すこと", async () => {
      using stubManager = new StubManager();

      stubManager.addStub(stub(
        QiitaFetcher.prototype,
        "fetch",
        () =>
          Promise.resolve(failure(
            new MediaFetchError("Failed to fetch Qiita articles"),
          )),
      ));

      const res = await sendRequest("POST", "/fetch_articles/articles/qiita");

      assertEquals(res.status, 500);
      const jsonRes = await res.json();
      assertEquals(jsonRes.message, "internal server error");
    });

    it("DBエラーが発生した場合、500エラーを返すこと", async () => {
      using stubManager = new StubManager();

      stubManager.addStub(stub(
        QiitaFetcher.prototype,
        "fetch",
        () =>
          Promise.resolve(success([
            {
              title: "title 1",
              author: "author",
              description: "content",
              url: "https://qiita.example.com/article1",
            },
          ])),
      ));

      stubManager.addStub(stub(
        ArticleRepositoryImpl.prototype,
        "fetchArticlesByUrls",
        () => Promise.resolve(success([])),
      ));

      stubManager.addStub(stub(
        ArticleRepositoryImpl.prototype,
        "bulkCreateArticle",
        () =>
          Promise.resolve(failure(
            new DatabaseError("Failed to save to database"),
          )),
      ));

      const res = await sendRequest("POST", "/fetch_articles/articles/qiita");

      assertEquals(res.status, 500);
      const jsonRes = await res.json();
      assertEquals(jsonRes.message, "internal server error");
    });

    it("予期せぬエラーが発生した場合、500エラーを返すこと", async () => {
      using stubManager = new StubManager();

      stubManager.addStub(stub(ExecutorImpl.prototype, "do", () => {
        throw new Error();
      }));

      const res = await sendRequest("POST", "/fetch_articles/articles/qiita");

      assertEquals(res.status, 500);
      const jsonRes = await res.json();
      assertEquals(jsonRes.message, "unknown error");
    });
  });
});

describe("POST /fetch_articles/articles/zenn", () => {
  describe("正常系", () => {
    it("Zennの記事を取得できること", async () => {
      using stubManager = new StubManager();

      const fetcherStub = stubManager.addStub(stub(
        ZennFetcher.prototype,
        "fetch",
        () =>
          Promise.resolve(success([
            {
              title: "title 1",
              author: "author",
              description: "content",
              url: "https://zenn.example.com/article1",
            },
            {
              title: "title 2",
              author: "author",
              description: "content",
              url: "https://zenn.example.com/article2",
            },
          ])),
      ));

      stubManager.addStub(stub(
        ArticleRepositoryImpl.prototype,
        "fetchArticlesByUrls",
        () => Promise.resolve(success([])),
      ));

      stubManager.addStub(stub(
        ArticleRepositoryImpl.prototype,
        "bulkCreateArticle",
        () =>
          Promise.resolve(success([
            new Article(
              BigInt(1),
              "zenn",
              "title 1",
              "author",
              "content",
              "https://zenn.example.com/article1",
              new Date(),
            ),
            new Article(
              BigInt(2),
              "zenn",
              "title 2",
              "author",
              "content",
              "https://zenn.example.com/article2",
              new Date(),
            ),
          ])),
      ));

      const res = await sendRequest("POST", "/fetch_articles/articles/zenn");

      assertEquals(res.status, 201);
      const jsonRes = await res.json();
      assertEquals(jsonRes.message, "Articles fetched successfully: 2");

      assertSpyCalls(fetcherStub, 1);
    });
  });

  describe("異常系", () => {
    it("Zennの記事のでエラーが発生した場合、500エラーを返すこと", async () => {
      using stubManager = new StubManager();

      stubManager.addStub(stub(
        ZennFetcher.prototype,
        "fetch",
        () =>
          Promise.resolve(failure(
            new MediaFetchError("Failed to fetch Zenn articles"),
          )),
      ));

      const res = await sendRequest("POST", "/fetch_articles/articles/zenn");

      assertEquals(res.status, 500);
      const jsonRes = await res.json();
      assertEquals(jsonRes.message, "internal server error");
    });

    it("DBエラーが発生した場合、500エラーを返すこと", async () => {
      using stubManager = new StubManager();

      stubManager.addStub(stub(
        ZennFetcher.prototype,
        "fetch",
        () =>
          Promise.resolve(success([
            {
              title: "title 1",
              author: "author",
              description: "content",
              url: "https://zenn.example.com/article1",
            },
          ])),
      ));

      stubManager.addStub(stub(
        ArticleRepositoryImpl.prototype,
        "fetchArticlesByUrls",
        () => Promise.resolve(success([])),
      ));

      stubManager.addStub(stub(
        ArticleRepositoryImpl.prototype,
        "bulkCreateArticle",
        () =>
          Promise.resolve(failure(
            new DatabaseError("Failed to save to database"),
          )),
      ));

      const res = await sendRequest("POST", "/fetch_articles/articles/zenn");

      assertEquals(res.status, 500);
      const jsonRes = await res.json();
      assertEquals(jsonRes.message, "internal server error");
    });

    it("予期せぬエラーが発生した場合、500エラーを返すこと", async () => {
      using stubManager = new StubManager();

      stubManager.addStub(stub(ExecutorImpl.prototype, "do", () => {
        throw new Error();
      }));

      const res = await sendRequest("POST", "/fetch_articles/articles/zenn");

      assertEquals(res.status, 500);
      const jsonRes = await res.json();
      assertEquals(jsonRes.message, "unknown error");
    });
  });
});
