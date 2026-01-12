import { faker } from '@faker-js/faker'
import getRdbClient from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'

process.env.NODE_ENV = 'test'

class ArticleTestHelper {
  private rdb = getRdbClient(TEST_ENV.DATABASE_URL)
  private createdArticleIds: bigint[] = []

  async createArticle(options?: {
    media?: 'qiita' | 'zenn'
    title?: string
    author?: string
    description?: string
    url?: string
    createdAt?: Date
  }) {
    const media = options?.media ?? faker.helpers.arrayElement(['qiita', 'zenn'])
    const url =
      options?.url ??
      (media === 'qiita'
        ? `https://qiita.com/${faker.internet.username()}/${faker.string.alphanumeric(20)}`
        : `https://zenn.dev/${faker.internet.username()}/${faker.string.alphanumeric(20)}`)

    const data = {
      media,
      title: options?.title ?? faker.lorem.sentence().substring(0, 100),
      author: options?.author ?? faker.person.fullName().substring(0, 30),
      description: options?.description ?? faker.lorem.paragraph().substring(0, 255),
      url,
      createdAt: options?.createdAt,
    }
    const article = await this.rdb.article.create({ data })
    this.createdArticleIds.push(article.articleId)
    return article
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
    return await this.rdb.readHistory.create({
      data: {
        activeUserId,
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

  async cleanUp(): Promise<void> {
    if (this.createdArticleIds.length > 0) {
      await this.rdb.readHistory.deleteMany({
        where: { articleId: { in: this.createdArticleIds } },
      })
      await this.rdb.article.deleteMany({
        where: { articleId: { in: this.createdArticleIds } },
      })
      this.createdArticleIds.length = 0
    }
  }

  async disconnect(): Promise<void> {
    await this.rdb.$disconnect()
  }
}

const articleTestHelper = new ArticleTestHelper()
export default articleTestHelper
