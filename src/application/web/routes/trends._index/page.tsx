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
import { Article } from './types'

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
  const handleClickPrevPage = () => {
    if (cursor.prev) {
      onPrevPage()
    }
  }
  const handleClickNextPage = () => {
    if (cursor.next) {
      onNextPage()
    }
  }
  return (
    <div className='relative min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6'>
      <h1 className='pb-4 text-xl italic'>- {date.toLocaleDateString('ja-JP')} -</h1>
      {articles.length === 0 ? (
        <div className='text-gray-500'>記事がありません</div>
      ) : (
        <>
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
                  className={`border-solid border-1 border-b-slate-400 ${!cursor.prev ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={handleClickPrevPage}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  className={`border-solid border-1 border-b-slate-400 ${!cursor.next ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={handleClickNextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
      <LoadingSpinner isLoading={isLoading} />
    </div>
  )
}
