import { useEffect } from 'react'
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
import { FetchArticles } from './useTrends'

type Props = {
  date: Date
  articles: Article[]
  fetchArticles: FetchArticles
  openDrawer: (article: Article) => void
  isLoading: boolean
  page: number
  totalPages: number
}

export default function TrendsPage({
  date,
  articles,
  fetchArticles,
  openDrawer,
  isLoading,
  page,
  totalPages,
}: Props) {
  const [searchParams] = useSearchParams()

  const handleCardClick = (article: Article) => {
    openDrawer(article)
  }
  const handlePrevPageClick = (isDisabled: boolean) => {
    if (!isDisabled && page > 1) {
      fetchArticles({ date, page: page - 1 })
    }
  }
  const handleNextPageClick = (isDisabled: boolean) => {
    if (!isDisabled && page < totalPages) {
      fetchArticles({ date, page: page + 1 })
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
                  aria-disabled={page <= 1}
                  className={getPaginationClass(page <= 1)}
                  onClick={() => handlePrevPageClick(page <= 1)}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  aria-disabled={page >= totalPages}
                  className={getPaginationClass(page >= totalPages)}
                  onClick={() => handleNextPageClick(page >= totalPages)}
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
