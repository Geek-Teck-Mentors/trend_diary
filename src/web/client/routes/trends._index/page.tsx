import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { twMerge } from 'tailwind-merge'
import { toJaDateString } from '@/common/locale'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/web/client/components/shadcn/pagination'
import LoadingSpinner from '../../components/ui/loading-spinner'
import ArticleCard from './components/article-card'
import MediaFilter, { MediaType } from './components/media-filter'
import type { Article } from './hooks/use-articles'

type Props = {
  date: Date
  articles: Article[]
  openDrawer: (article: Article) => void
  isLoading: boolean
  page: number
  totalPages: number
  selectedMedia: MediaType
  toNextPage: (currentPage: number) => void
  toPreviousPage: (currentPage: number) => void
  onMediaChange: (media: MediaType) => void
  onToggleRead: (articleId: string, isRead: boolean) => void
  isLoggedIn: boolean
}

export default function TrendsPage({
  date,
  articles,
  openDrawer,
  isLoading,
  page,
  totalPages,
  selectedMedia,
  toNextPage,
  toPreviousPage,
  onMediaChange,
  onToggleRead,
  isLoggedIn,
}: Props) {
  const [searchParams] = useSearchParams()

  const isPrevDisabled = page <= 1
  const isNextDisabled = page >= totalPages

  const handleCardClick = useCallback(
    (article: Article) => {
      openDrawer(article)
    },
    [openDrawer],
  )

  const handlePrevPageClick = () => {
    if (!isPrevDisabled) {
      toPreviousPage(page)
    }
  }

  const handleNextPageClick = () => {
    if (!isNextDisabled) {
      toNextPage(page)
    }
  }

  const getPaginationClass = (isDisabled: boolean) => {
    const baseClass = 'border-solid border-1 border-b-slate-400 cursor-pointer'
    return twMerge(baseClass, isDisabled ? 'opacity-50 cursor-not-allowed' : '')
  }

  // URLパラメータ変更時にページトップへスクロール
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [searchParams])

  return (
    <div className='relative min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6'>
      <h1 className='pb-4 text-xl italic'>- {toJaDateString(date)} -</h1>
      <div className='mb-4'>
        <MediaFilter selectedMedia={selectedMedia} onMediaChange={onMediaChange} />
      </div>
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
                onToggleRead={onToggleRead}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
          <Pagination className='mt-6'>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  aria-disabled={isPrevDisabled}
                  className={getPaginationClass(isPrevDisabled)}
                  onClick={handlePrevPageClick}
                />
              </PaginationItem>
              <PaginationItem>
                <span className='mx-4 text-sm'>
                  ページ {page} / {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  aria-disabled={isNextDisabled}
                  className={getPaginationClass(isNextDisabled)}
                  onClick={handleNextPageClick}
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
