import { faker } from '@faker-js/faker'
import { ARTICLE_MEDIA, type ArticleMedia } from '@/domain/article/media'
import { fromDbId, toDbId, toDbIds } from '@/infrastructure/rdb-id'
import { getTestRdb } from './rdb'

function getTodayJstNoon(): Date {
  const jstParts = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const year = jstParts.find((part) => part.type === 'year')?.value
  const month = jstParts.find((part) => part.type === 'month')?.value
  const day = jstParts.find((part) => part.type === 'day')?.value
  if (!year || !month || !day) {
    return new Date()
  }

  // INFO: trends APIは日付フィルタをJSTで評価するため、E2EデータもJST当日内に固定する
  return new Date(`${year}-${month}-${day}T12:00:00+09:00`)
}

export async function createArticle(options?: {
  media?: ArticleMedia
  title?: string
  author?: string
  description?: string
  url?: string
  createdAt?: Date
}) {
  const rdb = getTestRdb()
  const media = options?.media ?? faker.helpers.arrayElement(ARTICLE_MEDIA)
  let generatedUrl: string
  if (media === 'qiita') {
    generatedUrl = `https://qiita.com/${faker.internet.username()}/${faker.string.alphanumeric(20)}`
  } else if (media === 'zenn') {
    generatedUrl = `https://zenn.dev/${faker.internet.username()}/${faker.string.alphanumeric(20)}`
  } else {
    generatedUrl = `https://b.hatena.ne.jp/entry/s/${faker.internet.domainName()}/${faker.string.alphanumeric(20)}`
  }
  const url = options?.url ?? generatedUrl
  const uniqueSuffix = `tid-${crypto.randomUUID()}`

  const data = {
    media,
    title: options?.title ?? faker.lorem.sentence().substring(0, 100),
    author: options?.author ?? faker.person.fullName().substring(0, 30),
    description: options?.description ?? faker.lorem.paragraph().substring(0, 255),
    url: url.includes('?') ? `${url}&${uniqueSuffix}` : `${url}?${uniqueSuffix}`,
    createdAt: options?.createdAt ?? getTodayJstNoon(),
  }
  const article = await rdb.article.create({ data })
  return {
    ...article,
    articleId: fromDbId(article.articleId),
  }
}

export async function deleteArticle(articleId: bigint): Promise<void> {
  const rdb = getTestRdb()
  await rdb.readHistory.deleteMany({
    where: { articleId: toDbId(articleId) },
  })
  await rdb.article.deleteMany({
    where: { articleId: toDbId(articleId) },
  })
}

export async function findReadHistory(
  activeUserId: bigint,
  articleId: bigint,
): Promise<{ readHistoryId: bigint; readAt: Date } | null> {
  const rdb = getTestRdb()
  const readHistory = await rdb.readHistory.findFirst({
    where: {
      activeUserId: toDbId(activeUserId),
      articleId: toDbId(articleId),
    },
    select: {
      readHistoryId: true,
      readAt: true,
    },
  })
  if (!readHistory) return null
  return {
    ...readHistory,
    readHistoryId: fromDbId(readHistory.readHistoryId),
  }
}

export async function createReadHistory(activeUserId: bigint, articleId: bigint, readAt?: Date) {
  const rdb = getTestRdb()
  const readHistory = await rdb.readHistory.create({
    data: {
      activeUserId: toDbId(activeUserId),
      articleId: toDbId(articleId),
      readAt: readAt || faker.date.recent(),
    },
  })
  return {
    ...readHistory,
    readHistoryId: fromDbId(readHistory.readHistoryId),
    activeUserId: fromDbId(readHistory.activeUserId),
    articleId: fromDbId(readHistory.articleId),
  }
}

export async function deleteReadHistory(activeUserId: bigint, articleId: bigint): Promise<void> {
  const rdb = getTestRdb()
  await rdb.readHistory.deleteMany({
    where: {
      activeUserId: toDbId(activeUserId),
      articleId: toDbId(articleId),
    },
  })
}

export async function countReadHistories(activeUserId: bigint, articleId: bigint): Promise<number> {
  const rdb = getTestRdb()
  const count = await rdb.readHistory.count({
    where: {
      activeUserId: toDbId(activeUserId),
      articleId: toDbId(articleId),
    },
  })
  return count
}

export async function cleanUp(articleIds: bigint[]): Promise<void> {
  const rdb = getTestRdb()
  if (articleIds.length > 0) {
    const dbArticleIds = toDbIds(articleIds)
    await rdb.readHistory.deleteMany({
      where: { articleId: { in: dbArticleIds } },
    })
    await rdb.article.deleteMany({
      where: { articleId: { in: dbArticleIds } },
    })
  }
}
