import { OffsetPaginationResult } from '@/common/pagination'
import { ArticleOutput } from '@/domain/article/schema/articleSchema'

export type ArticleResponse = Omit<ArticleOutput, 'articleId'> & {
  articleId: string
}

export type ArticleListResponse = OffsetPaginationResult<ArticleResponse>
