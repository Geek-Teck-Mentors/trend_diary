import type { MetaFunction } from '@remix-run/cloudflare'
import ArticleDrawer from './components/ArticleDrawer'
import TrendsPage from './page'
import useArticleDrawerState from './useArticleDrawerState'
import useTrends from './useTrends'
import useTrendsState from './useTrendsState'

export const meta: MetaFunction = () => [{ title: 'トレンド一覧 | TrendDiary' }]

export default function Trends() {
  const { articles, fetchArticles, isLoading, cursor } = useTrendsState()
  const { date, handleNextPage, handlePrevPage } = useTrends({ fetchArticles, cursor })
  const { isOpen: isDrawerOpen, selectedArticle, open: openDrawer, close: closeDrawer } = useArticleDrawerState()

  return (
    <>
      <TrendsPage
        articles={articles}
        date={date}
        openDrawer={openDrawer}
        isLoading={isLoading}
        cursor={cursor}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
      />
      {selectedArticle && (
        <ArticleDrawer article={selectedArticle} isOpen={isDrawerOpen} onClose={closeDrawer} />
      )}
    </>
  )
}
