import { assert, assertEquals, assertThrowsAsync } from "https://deno.land/std@0.83.0/testing/asserts.ts";

import {
  assertSpyCallArgs,
  assertSpyCalls,
  stub,
} from "https://deno.land/std@0.152.0/testing/mock.ts";

import { QiitaFetcher } from "./qiita_fetcher.ts";
import Parser from "npm:rss-parser@3.13.0";
import { QiitaItem } from "../model/types.ts";
import { MediaFetchError } from "../error.ts";

// 正常系
Deno.test("ParserのparseURLが呼び出されること", async () => {
  const mockItems: QiitaItem[] = [
    { title: "Item 1", author: "Author 1", content: "Content1", link: "https://example.com/item1" },
    { title: "Item 2", author: "Author 2", content: "Content2", link: "https://example.com/item2" },
  ];
  const mockFeed = { items: mockItems };
  const parserStub = stub(Parser.prototype, "parseURL", () => {
    return Promise.resolve(mockFeed);
  });
  const fetcher = new QiitaFetcher();
  await fetcher.fetch();
  assertSpyCalls(parserStub, 1);
});

Deno.test("戻り値が、FeedItem[]であること", async () => {
  const mockItems: QiitaItem[] = [
    { title: "Item 1", author: "Author 1", content: "Content1", link: "https://example.com/item1" },
    { title: "Item 2", author: "Author 2", content: "Content2", link: "https://example.com/item2" },
  ];
  const mockFeed = { items: mockItems };
  const parserStub = stub(Parser.prototype, "parseURL", () => {
    return Promise.resolve(mockFeed);
  });
  const fetcher = new QiitaFetcher();
  const result = await fetcher.fetch();
  assert(result.length > 0);
  // FeedItem[]の型に合致することを確認
  result.forEach((item) => {
    assertEquals(Object.keys(item), ["title", "author", "description", "url"]);
  });

  parserStub.restore();
});

// 異常系
Deno.test("QiitaFetcher.fetch()が失敗すると、MediaFetchErrorが発生すること", async () => {
  const parserStub = stub(Parser.prototype, "parseURL", () => {
    return Promise.reject(new Error("Network error"));
  }
  );
  const fetcher = new QiitaFetcher();
  await assertThrowsAsync(
    async () => {
      await fetcher.fetch();
    }
    ,
    MediaFetchError,
    "Failed to process feed items: Error: Network error"
  );
  assertSpyCalls(parserStub, 1);
  assertSpyCallArgs(parserStub, 0, [fetcher.url]);
  parserStub.restore();
}
);
