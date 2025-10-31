import type { MetaFunction } from 'react-router'
import ArticleDrawer from './components/ArticleDrawer'
import TrendsPage from './page'
import useArticleDrawer from './useArticleDrawer'
import useTrends from './useTrends'

export const meta: MetaFunction = () => [{ title: 'トレンド一覧 | TrendDiary' }]

export default function Trends() {
  const {
    articles,
    isLoading,
    page,
    limit,
    totalPages,
    date,
    setSearchParams,
    handleMediaChange,
    handleDateChange,
    selectedMedia,
  } = useTrends()
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
        setSearchParams={setSearchParams}
        openDrawer={openDrawer}
        isLoading={isLoading}
        page={page}
        limit={limit}
        totalPages={totalPages}
        selectedMedia={selectedMedia}
        onMediaChange={handleMediaChange}
        onDateChange={handleDateChange}
      />
      {selectedArticle && (
        <ArticleDrawer article={selectedArticle} isOpen={isDrawerOpen} onClose={closeDrawer} />
      )}
    </>
  )
}
