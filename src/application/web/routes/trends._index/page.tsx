import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { twMerge } from 'tailwind-merge'
import { DatePicker } from '@/application/web/components/DatePicker'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/application/web/components/ui/pagination'
import type { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'
import LoadingSpinner from '../../components/LoadingSpinner'
import ArticleCard from './components/ArticleCard'

type Props = {
  date: Date
  articles: Article[]
  setSearchParams: ReturnType<typeof useSearchParams>[1]
  openDrawer: (article: Article) => void
  isLoading: boolean
  page: number
  limit: number
  totalPages: number
  onDateChange: (date: Date) => void
}

export default function TrendsPage({
  date,
  articles,
  setSearchParams,
  openDrawer,
  isLoading,
  page,
  limit,
  totalPages,
  onDateChange,
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

  const handlePageChange = useCallback(
    (newPage: number) => {
      const newParams = new URLSearchParams(searchParams)
      if (newPage > 1) {
        newParams.set('page', newPage.toString())
      } else {
        newParams.delete('page')
      }
      newParams.set('limit', limit.toString())
      setSearchParams(newParams)
    },
    [searchParams, limit, setSearchParams],
  )

  const handlePrevPageClick = useCallback(() => {
    if (!isPrevDisabled) {
      handlePageChange(page - 1)
    }
  }, [isPrevDisabled, page, handlePageChange])

  const handleNextPageClick = useCallback(() => {
    if (!isNextDisabled) {
      handlePageChange(page + 1)
    }
  }, [isNextDisabled, page, handlePageChange])
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
      <div className='mb-6 flex justify-center'>
        <DatePicker date={date} onDateChange={onDateChange} />
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
