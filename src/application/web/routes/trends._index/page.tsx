import { twMerge } from 'tailwind-merge'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/application/web/components/ui/pagination'
import { toJaDateString } from '@/common/utils/date'
import type { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'
import LoadingSpinner from '../../components/LoadingSpinner'
import { PaginationCursor } from '../../types/paginations'
import ArticleCard from './components/ArticleCard'
import { FetchArticles } from './useTrends'

type Props = {
  date: Date
  articles: Article[]
  fetchArticles: FetchArticles
  openDrawer: (article: Article) => void
  isLoading: boolean
  cursor: PaginationCursor
}

export default function TrendsPage({
  date,
  articles,
  fetchArticles,
  openDrawer,
  isLoading,
  cursor,
}: Props) {
  const handleCardClick = (article: Article) => {
    openDrawer(article)
  }
  const handlePrevPageClick = (isDisabled: boolean) => {
    if (cursor.prev && !isDisabled) {
      fetchArticles({ date, direction: 'prev' })
    }
  }
  const handleNextPageClick = (isDisabled: boolean) => {
    if (cursor.next && !isDisabled) {
      fetchArticles({ date, direction: 'next' })
    }
  }
  const getPaginationClass = (isDisabled: boolean) => {
    const baseClass = 'border-solid border-1 border-b-slate-400 cursor-pointer'
    return twMerge(baseClass, isDisabled ? 'opacity-50 cursor-not-allowed' : '')
  }

  return (
    <div className='relative min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6'>
      <h1 className='pb-4 text-xl italic'>- {toJaDateString(date)} -</h1>
      {articles.length === 0 ? (
        <div className='text-gray-500'>記事がありません</div>
      ) : (
        <div data-slot='page-content'>
          <div className='flex flex-wrap gap-6'>
            {articles.map((article) => (
              <ArticleCard
                key={article.articleId}
                article={article}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
          <Pagination className='mt-6'>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  aria-disabled={!cursor.prev}
                  className={getPaginationClass(!cursor.prev)}
                  onClick={() => handlePrevPageClick(!cursor.prev)}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  aria-disabled={!cursor.next}
                  className={getPaginationClass(!cursor.next)}
                  onClick={() => handleNextPageClick(!cursor.next)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {isLoading && <LoadingSpinner />}
    </div>
  )
}
