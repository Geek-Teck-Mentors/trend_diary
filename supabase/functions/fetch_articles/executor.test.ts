import { Executor } from "./executor.ts";
import { assertRejects } from "jsr:@std/assert";
import { assertEquals } from "https://deno.land/std@0.83.0/testing/asserts.ts";
import { afterEach, beforeEach, describe, it } from "jsr:@std/testing/bdd";
import type { ArticleFetcher, ArticleRepository } from "./model/interface.ts";
import { QiitaFetcher } from "./fetcher/qiita_fetcher.ts";
import ArticleRepositoryImpl from "./repository.ts";
import { rdbClient } from "../../infrastructure/supabase_client.ts";
import { restore, stub } from "https://deno.land/std@0.152.0/testing/mock.ts";
import { Article } from "./model/model.ts";

describe("Executor", () => {
  let fetcher: ArticleFetcher;
  let repository: ArticleRepository;

  const defaultItems = [
    {
      title: "タイトル",
      author: "著者",
      description: "説明",
      url: "https://example.com",
    },
  ];

  const defaultArticles = [
    new Article(
      1n,
      "タイトル",
      "著者",
      "説明",
      "https://example.com",
      "qiita",
    ),
  ];

  beforeEach(() => {
    fetcher = new QiitaFetcher();
    repository = new ArticleRepositoryImpl(rdbClient);
  });

  afterEach(() => {
    // 全てのスタブを解除
    restore();
  });

  describe("正常系", () => {
    it("fetch結果が0件の場合、no itemsのメッセージが返り、記事は登録されないこと", async () => {
      stub(fetcher, "fetch", () => Promise.resolve([]));
      stub(repository, "bulkCreateArticle", () => Promise.resolve([]));
      const executor = new Executor("qiita", fetcher, repository);
      const res = await executor.do();
      assertEquals(
        JSON.stringify(res),
        JSON.stringify({ message: "no items" }),
      );
    });

    it("fetch結果が1件以上の場合、記事が登録され、成功メッセージが返ること", async () => {
      stub(fetcher, "fetch", () => Promise.resolve(defaultItems));
      stub(
        repository,
        "bulkCreateArticle",
        () => Promise.resolve(defaultArticles),
      );
      const executor = new Executor("qiita", fetcher, repository);
      const res = await executor.do();
      assertEquals(
        JSON.stringify(res),
        JSON.stringify({ message: "Articles fetched successfully: 1" }),
      );
    });
  });

  describe("異常系", () => {
    it("fetcherでエラーが発生した場合、エラーが発生すること", async () => {
      // モックfetcherを用意してfetchでエラーを投げる
      const errorFetcher: ArticleFetcher = {
        url: "https://mocked.url",
        fetch: () => Promise.reject(new Error("fetch error")),
      };
      stub(
        repository,
        "bulkCreateArticle",
        () => Promise.resolve(defaultArticles),
      );
      const executor = new Executor("qiita", errorFetcher, repository);
      await assertRejects(() => executor.do(), Error, "fetch error");
    });

    it("repositoryでエラーが発生した場合、エラーがスローされること", async () => {
      // モックrepositoryを用意してbulkCreateArticleでエラーを投げる
      const errorRepository: ArticleRepository = {
        bulkCreateArticle: () => Promise.reject(new Error("db error")),
      };
      stub(fetcher, "fetch", () => Promise.resolve(defaultItems));
      const executor = new Executor("qiita", fetcher, errorRepository);
      await assertRejects(() => executor.do(), Error, "db error");
    });
  });
});
