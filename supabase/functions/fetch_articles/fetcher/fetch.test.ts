import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.83.0/testing/asserts.ts";

import {
  assertSpyCallArgs,
  assertSpyCalls,
  stub,
} from "https://deno.land/std@0.152.0/testing/mock.ts";

import Parser from "npm:rss-parser@3.13.0";
import { fetchRssFeed } from "./fetch.ts";

Deno.test("正常系", async (t) => {
  await t.step("Parser.prototype.parseURLが呼び出されること", async () => {
    const url = "https://example.com/rss";
    const mockItems = [
      { title: "Item 1", link: "https://example.com/item1" },
      { title: "Item 2", link: "https://example.com/item2" },
    ];
    const mockFeed = { items: mockItems };
    const parserStub = stub(Parser.prototype, "parseURL", () => {
      return Promise.resolve(mockFeed);
    });

    await fetchRssFeed(url);
    assertSpyCalls(parserStub, 1);
    assertSpyCallArgs(parserStub, 0, [url]);
    parserStub.restore();
  });

  await t.step(
    "戻り値がParser.prototype.parseURLから取得した<T[]>が返ってくること",
    async () => {
      const url = "https://example.com/rss";
      const mockItems = [
        { title: "Item 1", link: "https://example.com/item1" },
        { title: "Item 2", link: "https://example.com/item2" },
      ];
      const mockFeed = { items: mockItems };
      const parserStub = stub(Parser.prototype, "parseURL", () => {
        return Promise.resolve(mockFeed);
      });

      const result = await fetchRssFeed(url);
      assert(result.length > 0);
      assertEquals(result, mockItems);
      parserStub.restore();
    },
  );
});
