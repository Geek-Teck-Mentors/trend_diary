import type { MetaFunction } from 'react-router'
import ArticleDrawer from './components/article-drawer'
import TrendsPage from './page'
import useArticleDrawer from './use-article-drawer'
import useTrends from './use-trends'

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
      />
      {selectedArticle && (
        <ArticleDrawer article={selectedArticle} isOpen={isDrawerOpen} onClose={closeDrawer} />
      )}
    </>
  )
}
