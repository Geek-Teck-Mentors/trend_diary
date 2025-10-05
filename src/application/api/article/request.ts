import { ArticleQueryParams } from '@/domain/article'
import { ApiArticleQueryParams } from '@/domain/article/schema/articleQuerySchema'

export function convertApiArticleQueryParams(params: ApiArticleQueryParams): ArticleQueryParams {
  let readStatus: boolean | undefined
  if (params.read_status === '1') {
    readStatus = true
  } else if (params.read_status === '0') {
    readStatus = false
  } else {
    readStatus = undefined
  }

  return {
    limit: params.limit,
    page: params.page,
    title: params.title,
    author: params.author,
    media: params.media,
    from: params.from,
    to: params.to,
    readStatus,
  }
}
