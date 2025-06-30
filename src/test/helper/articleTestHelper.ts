import { faker } from '@faker-js/faker'
import getRdbClient from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'

process.env.NODE_ENV = 'test'

class ArticleTestHelper {
  private rdb = getRdbClient(TEST_ENV.DATABASE_URL)

  async createTestArticle() {
    return await this.rdb.article.create({
      data: {
        media: faker.helpers.arrayElement(['qiita', 'zenn']),
        title: faker.lorem.sentence(),
        author: faker.person.fullName(),
        description: faker.lorem.paragraph(),
        url: faker.internet.url(),
      },
    })
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

  async deleteAllReadHistories(): Promise<void> {
    await this.rdb.readHistory.deleteMany()
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
