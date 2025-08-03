import type { MetaFunction } from 'react-router';
import ArticleDrawer from './components/ArticleDrawer'
import TrendsPage from './page'
import useArticleDrawer from './useArticleDrawer'
import useTrends from './useTrends'

export const meta: MetaFunction = () => [{ title: 'トレンド一覧 | TrendDiary' }]

export default function Trends() {
  const { articles, fetchArticles, isLoading, cursor, date } = useTrends()
  const {
    isOpen: isDrawerOpen,
    selectedArticle,
    open: openDrawer,
    close: closeDrawer,
  } = useArticleDrawer()

  return (
    <>
      <TrendsPage
        date={date}
        articles={articles}
        fetchArticles={fetchArticles}
        openDrawer={openDrawer}
        isLoading={isLoading}
        cursor={cursor}
      />
      {selectedArticle && (
        <ArticleDrawer article={selectedArticle} isOpen={isDrawerOpen} onClose={closeDrawer} />
      )}
    </>
  )
}
