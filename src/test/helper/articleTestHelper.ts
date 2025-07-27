import { faker } from '@faker-js/faker'
import getRdbClient from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'

process.env.NODE_ENV = 'test'

class ArticleTestHelper {
  private rdb = getRdbClient(TEST_ENV.DATABASE_URL)

  async createArticle() {
    const data = {
      media: faker.helpers.arrayElement(['qiita', 'zenn']),
      // fakerの生成する文章はテーブルの制約を超えることがあるため、適切な長さに制限
      title: faker.lorem.sentence().substring(0, 100),
      author: faker.person.fullName(),
      description: faker.lorem.paragraph().substring(0, 255),
      url: faker.internet.url(),
    }
    return await this.rdb.article.create({ data })
  }

  async deleteArticle(articleId: bigint): Promise<void> {
    await this.rdb.article.deleteMany({
      where: {
        articleId,
      },
    })
  }

  async findReadHistory(
    userId: bigint,
    articleId: bigint,
  ): Promise<{ readHistoryId: bigint; readAt: Date } | null> {
    const readHistory = await this.rdb.readHistory.findFirst({
      where: {
        userId,
        articleId,
      },
      select: {
        readHistoryId: true,
        readAt: true,
      },
    })
    return readHistory
  }

  async createReadHistory(userId: bigint, articleId: bigint, readAt?: Date) {
    return await this.rdb.readHistory.create({
      data: {
        userId,
        articleId,
        readAt: readAt || faker.date.recent(),
      },
    })
  }

  async deleteReadHistory(userId: bigint, articleId: bigint): Promise<void> {
    await this.rdb.readHistory.deleteMany({
      where: {
        userId,
        articleId,
      },
    })
  }

  async countReadHistories(userId: bigint, articleId: bigint): Promise<number> {
    const count = await this.rdb.readHistory.count({
      where: {
        userId,
        articleId,
      },
    })
    return count
  }

  async cleanUpArticles(): Promise<void> {
    await this.rdb.$queryRaw`TRUNCATE TABLE "articles" CASCADE;`
  }

  async disconnect(): Promise<void> {
    await this.rdb.$disconnect()
  }
}

const articleTestHelper = new ArticleTestHelper()
export default articleTestHelper
