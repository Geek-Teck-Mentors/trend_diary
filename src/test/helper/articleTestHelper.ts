import { faker } from '@faker-js/faker'
import getRdbClient from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'
import activeUserTestHelper from './activeUserTestHelper'

process.env.NODE_ENV = 'test'

class ArticleTestHelper {
  private rdb = getRdbClient(TEST_ENV.DATABASE_URL)

  async createArticle(options?: { media?: 'qiita' | 'zenn' }) {
    const data = {
      media: options?.media ?? faker.helpers.arrayElement(['qiita', 'zenn']),
      title: faker.lorem.sentence().substring(0, 100),
      author: faker.person.fullName().substring(0, 30),
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
    activeUserId: bigint,
    articleId: bigint,
  ): Promise<{ readHistoryId: bigint; readAt: Date } | null> {
    const readHistory = await this.rdb.readHistory.findFirst({
      where: {
        activeUserId,
        articleId,
      },
      select: {
        readHistoryId: true,
        readAt: true,
      },
    })
    return readHistory
  }

  async createReadHistory(activeUserId: bigint, articleId: bigint, readAt?: Date) {
    // ActiveUserが存在することを確認
    const existingActiveUser = await this.rdb.activeUser.findUnique({
      where: { activeUserId },
    })

    let targetActiveUserId = activeUserId
    if (!existingActiveUser) {
      // ActiveUserが存在しない場合、テスト用のActiveUserを作成して、そのIDを使用
      const createdUser = await activeUserTestHelper.create(
        faker.internet.email(),
        'testPassword',
        'Test User',
      )
      targetActiveUserId = createdUser.activeUserId
    }

    return await this.rdb.readHistory.create({
      data: {
        activeUserId: targetActiveUserId,
        articleId,
        readAt: readAt || faker.date.recent(),
      },
    })
  }

  async deleteReadHistory(activeUserId: bigint, articleId: bigint): Promise<void> {
    await this.rdb.readHistory.deleteMany({
      where: {
        activeUserId,
        articleId,
      },
    })
  }

  async countReadHistories(activeUserId: bigint, articleId: bigint): Promise<number> {
    const count = await this.rdb.readHistory.count({
      where: {
        activeUserId,
        articleId,
      },
    })
    return count
  }

  async cleanUpArticles(): Promise<void> {
    await this.rdb.$queryRaw`TRUNCATE TABLE "articles" CASCADE;`
  }

  getRdb() {
    return this.rdb
  }

  async disconnect(): Promise<void> {
    await this.rdb.$disconnect()
  }
}

const articleTestHelper = new ArticleTestHelper()
export default articleTestHelper
