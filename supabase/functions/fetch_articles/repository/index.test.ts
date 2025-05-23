import { assertEquals, assertThrowsAsync } from "https://deno.land/std@0.83.0/testing/asserts.ts";
import {
  assertSpyCallArgs,
  assertSpyCalls,
  stub,
} from "https://deno.land/std@0.152.0/testing/mock.ts";

import ArticleRepositoryImpl from "./index.ts";
import { Article, ArticleInput } from "../model/model.ts";
import { DatabaseError } from "../error.ts";
import { logger } from "../../../logger/logger.ts";
import type { RdbClient } from "../../../infrastructure/supabase_client.ts";
import type { TablesInsert } from "../../../infrastructure/database.types.ts";

// 正常系テスト
Deno.test("bulkCreateArticle - 正常にarticleを作成できること", async () => {
  const mockData: Article[] = [
    new Article(
      1n,
      "Qiita",
      "Test Article 1",
      "Test Author 1",
      "Test Description 1",
      "https://example.com/1"
    ),
    new Article(
      2n,
      "Qiita",
      "Test Article 2",
      "Test Author 2",
      "Test Description 2",
      "https://example.com/2"
    ),
  ];

  const mockRdbClient = {
    from: (_tableName: string) => ({
      insert: (_data: TablesInsert<"articles">[]) => ({
        select: () => ({
          returns: () => Promise.resolve({ data: mockData, error: null }),
        }),
      }),
    }),
  } as unknown as RdbClient;

  const loggerStub = stub(logger, "info");

  const repository = new ArticleRepositoryImpl(mockRdbClient);

  const inputData: ArticleInput[] = [
    {
      media: "Qiita",
      title: "Test Article 1",
      author: "Test Author 1",
      description: "Test Description 1",
      url: "https://example.com/1",
    },
    {
      media: "Qiita",
      title: "Test Article 2",
      author: "Test Author 2",
      description: "Test Description 2",
      url: "https://example.com/2",
    },
  ];

  const result = await repository.bulkCreateArticle(inputData);

  assertEquals(result, mockData);
  assertSpyCalls(loggerStub, 1);
  assertSpyCallArgs(loggerStub, 0, ["Inserted articles into Supabase successfully"]);

  loggerStub.restore();
});

Deno.test("bulkCreateArticle - 文字数制限による正規化が正常に動作すること", async () => {
  const mockData: Article[] = [
    new Article(
      1n,
      "a".repeat(10), // 10文字に制限される
      "a".repeat(100), // 100文字に制限される
      "a".repeat(30), // 30文字に制限される
      "a".repeat(255), // 255文字に制限される
      "https://example.com/1"
    ),
  ];

  const mockRdbClient = {
    from: (_tableName: string) => ({
      insert: (_data: TablesInsert<"articles">[]) => ({
        select: () => ({
          returns: () => Promise.resolve({ data: mockData, error: null }),
        }),
      }),
    }),
  } as unknown as RdbClient;

  const loggerStub = stub(logger, "info");

  const repository = new ArticleRepositoryImpl(mockRdbClient);

  const inputData: ArticleInput[] = [
    {
      media: "a".repeat(15), // 10文字を超える
      title: "a".repeat(120), // 100文字を超える
      author: "a".repeat(50), // 30文字を超える
      description: "a".repeat(300), // 255文字を超える
      url: "https://example.com/1",
    },
  ];

  const result = await repository.bulkCreateArticle(inputData);

  assertEquals(result, mockData);
  assertSpyCalls(loggerStub, 1);

  loggerStub.restore();
});

Deno.test("bulkCreateArticle - 空の配列を渡した場合も正常に処理されること", async () => {
  const mockData: Article[] = [];

  const mockRdbClient = {
    from: (_tableName: string) => ({
      insert: (_data: TablesInsert<"articles">[]) => ({
        select: () => ({
          returns: () => Promise.resolve({ data: mockData, error: null }),
        }),
      }),
    }),
  } as unknown as RdbClient;

  const loggerStub = stub(logger, "info");

  const repository = new ArticleRepositoryImpl(mockRdbClient);

  const inputData: ArticleInput[] = [];

  const result = await repository.bulkCreateArticle(inputData);

  assertEquals(result, mockData);
  assertSpyCalls(loggerStub, 1);
  assertSpyCallArgs(loggerStub, 0, ["Inserted articles into Supabase successfully"]);

  loggerStub.restore();
});

// 凖正常系テスト
Deno.test("bulkCreateArticle - データベースエラーが発生した場合にDatabaseErrorが発生すること", async () => {
  const mockError = {
    message: "Database connection failed",
    code: "CONNECTION_ERROR",
  };

  const mockRdbClient = {
    from: (_tableName: string) => ({
      insert: (_data: TablesInsert<"articles">[]) => ({
        select: () => ({
          returns: () => Promise.resolve({ data: null, error: mockError }),
        }),
      }),
    }),
  } as unknown as RdbClient;

  const loggerStub = stub(logger, "info");

  const repository = new ArticleRepositoryImpl(mockRdbClient);

  const inputData: ArticleInput[] = [
    {
      media: "Qiita",
      title: "Test Article",
      author: "Test Author",
      description: "Test Description",
      url: "https://example.com/1",
    },
  ];

  await assertThrowsAsync(
    async () => {
      await repository.bulkCreateArticle(inputData);
    },
    DatabaseError,
    'Failed to create article: {"message":"Database connection failed","code":"CONNECTION_ERROR"}'
  );

  assertSpyCalls(loggerStub, 0); // エラー時はlogが呼ばれない

  loggerStub.restore();
});

Deno.test("bulkCreateArticle - データが返されない場合にDatabaseErrorが発生すること", async () => {
  const mockRdbClient = {
    from: (_tableName: string) => ({
      insert: (_data: TablesInsert<"articles">[]) => ({
        select: () => ({
          returns: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    }),
  } as unknown as RdbClient;

  const loggerStub = stub(logger, "info");

  const repository = new ArticleRepositoryImpl(mockRdbClient);

  const inputData: ArticleInput[] = [
    {
      media: "Qiita",
      title: "Test Article",
      author: "Test Author",
      description: "Test Description",
      url: "https://example.com/1",
    },
  ];

  await assertThrowsAsync(
    async () => {
      await repository.bulkCreateArticle(inputData);
    },
    DatabaseError,
    "No data returned from Supabase"
  );

  assertSpyCalls(loggerStub, 0); // エラー時はlogが呼ばれない

  loggerStub.restore();
});

