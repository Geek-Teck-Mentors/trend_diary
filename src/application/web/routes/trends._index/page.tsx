import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { twMerge } from 'tailwind-merge'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/application/web/components/ui/pagination'
import { toJaDateString } from '@/common/locale'
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
  const handlePrevPageClick = useCallback(() => {
    if (!isPrevDisabled) {
      const newParams = new URLSearchParams(searchParams)
      const newPage = page - 1
      if (newPage > 1) {
        newParams.set('page', newPage.toString())
      } else {
        newParams.delete('page')
      }
      newParams.set('limit', limit.toString())
      setSearchParams(newParams)
    }
  }, [isPrevDisabled, page, searchParams, limit, setSearchParams])
  const handleNextPageClick = useCallback(() => {
    if (!isNextDisabled) {
      const newParams = new URLSearchParams(searchParams)
      newParams.set('page', (page + 1).toString())
      newParams.set('limit', limit.toString())
      setSearchParams(newParams)
    }
  }, [isNextDisabled, page, searchParams, limit, setSearchParams])
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
