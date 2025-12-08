import type { MetaFunction } from 'react-router'
import { useOutletContext } from 'react-router'
import type { TrendsOutletContext } from '../trends'
import ArticleDrawer from './components/article-drawer'
import useArticleDrawer from './hooks/use-article-drawer'
import useReadArticle from './hooks/use-read-article'
import useTrends from './hooks/use-trends'
import TrendsPage from './page'

export const meta: MetaFunction = () => [{ title: 'トレンド一覧 | TrendDiary' }]

export default function Trends() {
  const { isLoggedIn } = useOutletContext<TrendsOutletContext>()
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
    updateArticleReadStatus,
  } = useTrends()
  const {
    isOpen: isDrawerOpen,
    selectedArticle,
    open: openDrawer,
    close: closeDrawer,
  } = useArticleDrawer()
  const { markAsRead, markAsUnread } = useReadArticle()

  const handleToggleRead = async (articleId: bigint, isRead: boolean) => {
    const success = isRead
      ? await markAsRead(articleId.toString())
      : await markAsUnread(articleId.toString())
    if (success) {
      updateArticleReadStatus(articleId, isRead)
    }
  }

  const handleMarkAsRead = async (articleId: string) => {
    await handleToggleRead(BigInt(articleId), true)
  }

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
        onToggleRead={handleToggleRead}
        isLoggedIn={isLoggedIn}
      />
      {selectedArticle && (
        <ArticleDrawer
          article={selectedArticle}
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
          onMarkAsRead={handleMarkAsRead}
          onToggleRead={handleToggleRead}
          isLoggedIn={isLoggedIn}
        />
      )}
    </>
  )
}
