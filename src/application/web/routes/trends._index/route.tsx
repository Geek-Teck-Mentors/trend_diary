import type { MetaFunction } from "@remix-run/cloudflare";
import ArticleDrawer from "./components/ArticleDrawer";
import TrendsPage from "./page";
import useArticleDrawerState from "./useArticleDrawerState";
import useTrends from "./useTrends";

export const meta: MetaFunction = () => [
  { title: "トレンド一覧 | TrendDiary" },
];

export default function Trends() {
  const { articles, isLoading, cursor, date, handleNextPage, handlePrevPage } =
    useTrends();
  const {
    isOpen: isDrawerOpen,
    selectedArticle,
    open: openDrawer,
    close: closeDrawer,
  } = useArticleDrawerState();

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
        <ArticleDrawer
          article={selectedArticle}
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
        />
      )}
    </>
  );
}
