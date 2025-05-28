import { Executor } from "./executor.ts";
import { assertRejects } from "jsr:@std/assert";
import { assertEquals } from "https://deno.land/std@0.83.0/testing/asserts.ts";
import type { FeedItem } from "./model/types.ts";
import type { ArticleInput } from "./model/model.ts";
import type { ArticleFetcher, ArticleRepository } from "./model/interface.ts";

function createMockFetcher(items: FeedItem[] | (() => never)): ArticleFetcher {
  return {
    url: "https://mock.url",
    fetch: typeof items === "function"
      ? () => { (items as () => never)(); return Promise.resolve([]); }
      : () => Promise.resolve(items),
  };
}

function createMockRepository(articles: ArticleInput[] | (() => never)): ArticleRepository {
  return {
    bulkCreateArticle: typeof articles === "function"
      ? () => { (articles as () => never)(); return Promise.resolve([]); }
      : (_params) => Promise.resolve((articles as ArticleInput[]).map((a, i) => ({
          ...a,
          articleId: BigInt(i + 1),
          createdAt: new Date(),
        }))),
  };
}

Deno.test("正常系", async (t) => {
  await t.step("fetch結果が0件の場合、no itemsのメッセージが返り、記事は登録されないこと", async () => {
    const mockFetcher = createMockFetcher([]);
    const mockRepository = createMockRepository([]);
    const executor = new Executor("qiita", mockFetcher, mockRepository);
    const res = await executor.do();
    assertEquals(JSON.stringify(res), JSON.stringify({ message: "no items" }));
  }
  );
  await t.step("fetch結果が1件以上の場合、記事が登録され、成功メッセージが返ること", async () => {
    const items: FeedItem[] = [
      { title: "タイトル", author: "著者", description: "説明", url: "https://example.com" },
    ];
    const mockFetcher = createMockFetcher(items);
    const mockRepository = createMockRepository(items.map(item => ({ ...item, media: "qiita", })));
    const executor = new Executor("qiita", mockFetcher, mockRepository);
    const res = await executor.do();
    assertEquals(JSON.stringify(res), JSON.stringify({ message: "Articles fetched successfully: 1" }));
  }
  );
});

Deno.test("異常系", async (t) => {
  await t.step("fetcherでエラーが発生した場合、エラーがが発生すること", async () => {
    const mockFetcher = createMockFetcher(() => { throw new Error("fetch error"); });
    const mockRepository = createMockRepository([]);
    const executor = new Executor("qiita", mockFetcher, mockRepository);
    await assertRejects(() => executor.do(), Error, "fetch error");
  });
  await t.step("repositoryでエラーが発生した場合、エラーがスローされること", async () => {
    const items: FeedItem[] = [
      { title: "タイトル", author: "著者", description: "説明", url: "https://example.com" },
    ];
    const mockFetcher = createMockFetcher(items);
    const mockRepository = createMockRepository(() => { throw new Error("db error"); });
    const executor = new Executor("zenn", mockFetcher, mockRepository);
    await assertRejects(() => executor.do(), Error, "db error");
  });
});
