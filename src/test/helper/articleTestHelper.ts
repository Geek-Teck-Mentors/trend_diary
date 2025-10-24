import { faker } from '@faker-js/faker'
import getRdbClient from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'
import authTestHelper from './authTestHelper'

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
    // Userが存在することを確認
    const existingUser = await this.rdb.user.findUnique({
      where: { userId },
    })

    let targetUserId = userId
    if (!existingUser) {
      // Userが存在しない場合、テスト用のUserを作成して、そのIDを使用
      const createdUser = await authTestHelper.create(faker.internet.email(), 'testPassword')
      targetUserId = createdUser.userId
    }

    return await this.rdb.readHistory.create({
      data: {
        userId: targetUserId,
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
