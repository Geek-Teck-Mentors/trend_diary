import { Executor } from "./executor.ts";
import { assertRejects } from "jsr:@std/assert";
import { assertEquals } from "https://deno.land/std@0.83.0/testing/asserts.ts";
import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import type { FeedItem } from "./model/types.ts";
import type { ArticleFetcher, ArticleRepository } from "./model/interface.ts";
import { QiitaFetcher } from "./fetcher/qiita_fetcher.ts";
import ArticleRepositoryImpl from "./repository.ts";
import { rdbClient } from "../../infrastructure/supabase_client.ts";
import { stub } from "https://deno.land/std@0.152.0/testing/mock.ts";
import { Article } from "./model/model.ts";

describe("Executor", () => {
  let fetcher: ArticleFetcher;
  let repository: ArticleRepository;
  let items: FeedItem[] = [
    {
      title: "タイトル",
      author: "著者",
      description: "説明",
      url: "https://example.com",
    },
  ];

  let articles: Article[] = [
    new Article(
      1n,
      "タイトル",
      "著者",
      "説明",
      "https://example.com",
      "qiita",
    ),
  ];

  beforeAll(() => {
    fetcher = new QiitaFetcher();
    stub(fetcher, "fetch", () => Promise.resolve(items));

    repository = new ArticleRepositoryImpl(rdbClient);
    stub(repository, "bulkCreateArticle", () => Promise.resolve(articles));
  });

  describe("正常系", () => {
    it("fetch結果が0件の場合、no itemsのメッセージが返り、記事は登録されないこと", async () => {
      items = [];
      articles = [];
      const executor = new Executor("qiita", fetcher, repository);
      const res = await executor.do();
      assertEquals(
        JSON.stringify(res),
        JSON.stringify({ message: "no items" }),
      );
    });

    it("fetch結果が1件以上の場合、記事が登録され、成功メッセージが返ること", async () => {
      const executor = new Executor("qiita", fetcher, repository);
      const res = await executor.do();
      assertEquals(
        JSON.stringify(res),
        JSON.stringify({ message: "Articles fetched successfully: 1" }),
      );
    });
  });

  describe("異常系", () => {
    it("fetcherでエラーが発生した場合、エラーがが発生すること", async () => {
      stub(fetcher, "fetch", () => Promise.reject(new Error("fetch error")));
      const executor = new Executor("qiita", fetcher, repository);
      await assertRejects(() => executor.do(), Error, "fetch error");
    });

    it("repositoryでエラーが発生した場合、エラーがスローされること", async () => {
      stub(
        repository,
        "bulkCreateArticle",
        () => Promise.reject(new Error("db error")),
      );
      const executor = new Executor("qiita", fetcher, repository);
      await assertRejects(() => executor.do(), Error, "db error");
    });
  });
});
