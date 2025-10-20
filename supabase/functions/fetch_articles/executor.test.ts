import { ExecutorImpl } from "./executor.ts";
import { assertEquals } from "https://deno.land/std@0.83.0/testing/asserts.ts";
import { afterEach, beforeEach, describe, it } from "jsr:@std/testing/bdd";
import type { ArticleFetcher, ArticleRepository } from "./model/interface.ts";
import { QiitaFetcher } from "./fetcher/qiita_fetcher.ts";
import ArticleRepositoryImpl from "./repository.ts";
import { rdbClient } from "../../infrastructure/supabase_client.ts";
import { restore, stub } from "https://deno.land/std@0.152.0/testing/mock.ts";
import { Article, ArticleInput } from "./model/model.ts";

describe("Executor", () => {
  let fetcher: ArticleFetcher;
  let repository: ArticleRepository;

  const defaultItems = [
    {
      title: "タイトル",
      author: "著者",
      description: "説明",
      url: "https://example.com/item",
    },
  ];

  const defaultArticles = [
    new Article(
      1n,
      "qiita",
      "タイトル",
      "著者",
      "説明",
      "https://example.com/article",
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
      stub(fetcher, "fetch", () => Promise.resolve({ data: [], error: null }));
      stub(repository, "fetchArticlesByUrls", () => Promise.resolve({ data: [], error: null }));
      stub(repository, "bulkCreateArticle", () => Promise.resolve({ data: [], error: null }));
      const executor = new ExecutorImpl("qiita", fetcher, repository);
      const res = await executor.do();
      assertEquals(
        JSON.stringify(res),
        JSON.stringify({ message: "no items", error: null }),
      );
    });

    it("fetch結果が1件以上の場合、記事が登録され、成功メッセージが返ること", async () => {
      stub(fetcher, "fetch", () => Promise.resolve({ data: defaultItems, error: null }));
      stub(repository, "fetchArticlesByUrls", () => Promise.resolve({ data: [], error: null }));
      stub(
        repository,
        "bulkCreateArticle",
        () => Promise.resolve({ data: defaultArticles, error: null }),
      );
      const executor = new ExecutorImpl("qiita", fetcher, repository);
      const res = await executor.do();
      assertEquals(
        JSON.stringify(res),
        JSON.stringify({ message: "Articles fetched successfully: 1", error: null }),
      );
    });

    it("すでに存在する記事は登録されないこと", async () => {
      const existingUrl = "https://example.com/existing";
      const newUrl = "https://example.com/new";
      // fetcherが2件の記事を返すようにスタブ
      const fetchedItems = [
        {
          title: "重複する記事",
          author: "著者1",
          description: "説明1",
          url: existingUrl,
        },
        {
          title: "新規記事",
          author: "著者2",
          description: "説明2",
          url: newUrl,
        },
      ];

      // repositoryが1件の記事を既存記事として返すようにスタブ
      const existingArticles = [
        new Article(
          1n,
          "qiita",
          "既存記事",
          "著者1",
          "説明1",
          existingUrl,
        ),
      ];

      // bulkCreateArticleが1件の記事を登録したとして返すようにスタブ
      const createdArticles = [
        new Article(
          2n,
          "qiita",
          "新規記事",
          "著者2",
          "説明2",
          newUrl,
        ),
      ];

      // モックリポジトリを作成
      let bulkCreateArticleArgs: ArticleInput[] = [];
      const mockBulkCreateArticle = (params: ArticleInput[]) => {
        bulkCreateArticleArgs = params;
        return Promise.resolve({ data: createdArticles, error: null });
      };

      // モックフェッチャーを作成
      stub(fetcher, "fetch", () => Promise.resolve({ data: fetchedItems, error: null }));
      stub(
        repository,
        "fetchArticlesByUrls",
        () => Promise.resolve({ data: existingArticles, error: null }),
      );
      stub(repository, "bulkCreateArticle", mockBulkCreateArticle);

      const executor = new ExecutorImpl("qiita", fetcher, repository);
      const res = await executor.do();

      // bulkCreateArticleに渡されたのは1件の記事であることを検証
      assertEquals(bulkCreateArticleArgs.length, 1);
      assertEquals(bulkCreateArticleArgs[0].url, newUrl);

      assertEquals(
        JSON.stringify(res),
        JSON.stringify({ message: "Articles fetched successfully: 1", error: null }),
      );
    });
  });

  describe("異常系", () => {
    it("fetcherでエラーが発生した場合、エラーが返されること", async () => {
      const fetchError = new Error("fetch error");
      stub(fetcher, "fetch", () => Promise.resolve({ data: [], error: fetchError }));
      stub(
        repository,
        "bulkCreateArticle",
        () => Promise.resolve({ data: defaultArticles, error: null }),
      );
      const executor = new ExecutorImpl("qiita", fetcher, repository);
      const res = await executor.do();
      assertEquals(res.message, null);
      assertEquals(res.error?.message, "fetch error");
    });

    it("repositoryのfetchArticlesByUrlsでエラーが発生した場合、エラーが返されること", async () => {
      const dbError = new Error("db fetch error");
      stub(fetcher, "fetch", () => Promise.resolve({ data: defaultItems, error: null }));
      stub(repository, "fetchArticlesByUrls", () => Promise.resolve({ data: [], error: dbError }));
      stub(repository, "bulkCreateArticle", () => Promise.resolve({ data: defaultArticles, error: null }));
      const executor = new ExecutorImpl("qiita", fetcher, repository);
      const res = await executor.do();
      assertEquals(res.message, null);
      assertEquals(res.error?.message, "db fetch error");
    });

    it("repositoryのbulkCreateArticleでエラーが発生した場合、エラーが返されること", async () => {
      const dbError = new Error("db create error");
      stub(fetcher, "fetch", () => Promise.resolve({ data: defaultItems, error: null }));
      stub(repository, "fetchArticlesByUrls", () => Promise.resolve({ data: [], error: null }));
      stub(repository, "bulkCreateArticle", () => Promise.resolve({ data: [], error: dbError }));
      const executor = new ExecutorImpl("qiita", fetcher, repository);
      const res = await executor.do();
      assertEquals(res.message, null);
      assertEquals(res.error?.message, "db create error");
    });
  });
});
