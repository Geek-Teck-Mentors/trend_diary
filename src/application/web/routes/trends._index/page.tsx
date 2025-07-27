import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/application/web/components/ui/pagination'
import LoadingSpinner from '../../components/LoadingSpinner'
import { PaginationCursor } from '../../types/paginations'
import ArticleCard from './components/ArticleCard'
import type { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'
import { twMerge } from 'tailwind-merge'

type Props = {
  articles: Article[]
  date: Date
  openDrawer: (article: Article) => void
  isLoading: boolean
  cursor: PaginationCursor
  onNextPage: () => void
  onPrevPage: () => void
}

export default function TrendsPage({
  articles,
  date,
  openDrawer,
  isLoading,
  cursor,
  onNextPage,
  onPrevPage,
}: Props) {
  const handleCardClick = (article: Article) => {
    openDrawer(article)
  }
  const handlePrevPageClick = (isDisabled: boolean) => {
    if (cursor.prev && !isDisabled) {
      onPrevPage()
    }
  }
  const handleNextPageClick = (isDisabled: boolean) => {
    if (cursor.next && !isDisabled) {
      onNextPage()
    }
  }
  const getPaginationClass = (isDisabled: boolean) => {
    const baseClass = 'border-solid border-1 border-b-slate-400 cursor-pointer'
    return twMerge(
      baseClass,
      isDisabled ? 'opacity-50 cursor-not-allowed' : ''
    )
  }

  return (
    <div className='relative min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6'>
      <h1 className='pb-4 text-xl italic'>- {date.toLocaleDateString('ja-JP')} -</h1>
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
      <LoadingSpinner isLoading={isLoading} />
    </div>
  )
}
