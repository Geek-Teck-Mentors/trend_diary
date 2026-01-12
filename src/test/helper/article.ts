import { faker } from '@faker-js/faker'
import getRdbClient from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'

process.env.NODE_ENV = 'test'

const rdb = getRdbClient(TEST_ENV.DATABASE_URL)

export async function createArticle(options?: {
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
  return await rdb.article.create({ data })
}

export async function deleteArticle(articleId: bigint): Promise<void> {
  await rdb.readHistory.deleteMany({
    where: { articleId },
  })
  await rdb.article.deleteMany({
    where: { articleId },
  })
}

export async function findReadHistory(
  activeUserId: bigint,
  articleId: bigint,
): Promise<{ readHistoryId: bigint; readAt: Date } | null> {
  const readHistory = await rdb.readHistory.findFirst({
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

export async function createReadHistory(activeUserId: bigint, articleId: bigint, readAt?: Date) {
  return await rdb.readHistory.create({
    data: {
      activeUserId,
      articleId,
      readAt: readAt || faker.date.recent(),
    },
  })
}

export async function deleteReadHistory(activeUserId: bigint, articleId: bigint): Promise<void> {
  await rdb.readHistory.deleteMany({
    where: {
      activeUserId,
      articleId,
    },
  })
}

export async function countReadHistories(activeUserId: bigint, articleId: bigint): Promise<number> {
  const count = await rdb.readHistory.count({
    where: {
      activeUserId,
      articleId,
    },
  })
  return count
}

export async function cleanUp(articleIds: bigint[]): Promise<void> {
  if (articleIds.length > 0) {
    await rdb.readHistory.deleteMany({
      where: { articleId: { in: articleIds } },
    })
    await rdb.article.deleteMany({
      where: { articleId: { in: articleIds } },
    })
  }
}

export async function disconnect(): Promise<void> {
  await rdb.$disconnect()
}
