import { PrismaClient } from '@prisma/client';
import getRdbClient from '@/infrastructure/rdb';
import app from '../../server';
import TEST_ENV from '@/test/env';
import { ArticleListResponse } from './types/response';

type GetArticlesTestCase = {
  name: string;
  query: string;
  status: number;
};

describe('GET /api/articles', () => {
  let db: PrismaClient;

  const testArticles = [
    {
      media: 'qiita',
      title: 'Reactの基礎',
      author: '山田太郎',
      description: 'Reactについて学ぼう',
      url: 'https://qiita.com/test1',
      createdAt: new Date('2025-05-11'),
    },
    {
      media: 'zenn',
      title: 'TypeScriptの応用',
      author: '佐藤花子',
      description: 'TypeScriptの高度な機能',
      url: 'https://zenn.dev/test2',
      createdAt: new Date('2025-05-12'),
    },
  ];

  async function cleanUp(): Promise<void> {
    await db.$queryRaw`TRUNCATE TABLE "articles";`;
  }

  async function setupTestData(): Promise<void> {
    await Promise.all(testArticles.map((article) => db.article.create({ data: article })));
  }

  async function requestGetArticles(query: string = '') {
    const url = query ? `/api/articles?${query}` : '/api/articles';
    return app.request(url, { method: 'GET' }, TEST_ENV);
  }

  beforeAll(() => {
    db = getRdbClient(TEST_ENV.DATABASE_URL);
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  beforeEach(async () => {
    await setupTestData();
  });

  afterEach(async () => {
    await cleanUp();
  });

  describe('正常系', () => {
    it('全件取得', async () => {
      const res = await requestGetArticles();

      expect(res.status).toBe(200);
      const data: ArticleListResponse = await res.json();
      expect(data).toHaveLength(2);
      expect(data[0].title).toBe('TypeScriptの応用');
      expect(data[1].title).toBe('Reactの基礎');
    });

    it('titleで検索', async () => {
      const res = await requestGetArticles('title=React');

      expect(res.status).toBe(200);
      const data = (await res.json()) as any[];
      expect(data).toHaveLength(1);
      expect(data[0].title).toBe('Reactの基礎');
    });

    it('authorで検索', async () => {
      const res = await requestGetArticles('author=山田');

      expect(res.status).toBe(200);
      const data = (await res.json()) as any[];
      expect(data).toHaveLength(1);
      expect(data[0].author).toBe('山田太郎');
    });

    it('mediaで検索', async () => {
      const res = await requestGetArticles('media=qiita');

      expect(res.status).toBe(200);
      const data = (await res.json()) as any[];
      expect(data).toHaveLength(1);
      expect(data[0].media).toBe('qiita');
    });

    it('dateで検索', async () => {
      const res = await requestGetArticles('date=2025-05-11');

      expect(res.status).toBe(200);
      const data = (await res.json()) as any[];
      expect(data).toHaveLength(1);
      expect(data[0].title).toBe('Reactの基礎');
    });

    it('read_statusパラメータを受け取る（無視される）', async () => {
      const res = await requestGetArticles('read_status=1');

      expect(res.status).toBe(200);
      const data = (await res.json()) as any[];
      expect(data).toHaveLength(2);
    });

    it('複数条件での検索', async () => {
      const res = await requestGetArticles('media=qiita&author=山田');

      expect(res.status).toBe(200);
      const data = (await res.json()) as any[];
      expect(data).toHaveLength(1);
      expect(data[0].title).toBe('Reactの基礎');
    });
  });

  describe('準正常系', () => {
    const testCases: GetArticlesTestCase[] = [
      {
        name: '不正なmedia値',
        query: 'media=invalid',
        status: 422,
      },
      {
        name: '不正なdate形式',
        query: 'date=2025/05/11',
        status: 422,
      },
      {
        name: '不正なread_status値',
        query: 'read_status=2',
        status: 422,
      },
    ];

    testCases.forEach((testCase) => {
      it(testCase.name, async () => {
        const res = await requestGetArticles(testCase.query);
        expect(res.status).toBe(testCase.status);
      });
    });
  });
});
