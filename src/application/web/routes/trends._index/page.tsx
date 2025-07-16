import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/application/web/components/ui/pagination";
import LoadingSpinner from "../../components/LoadingSpinner";
import { PaginationCursor } from "../../types/paginations";
import ArticleCard from "./components/ArticleCard";
import { Article } from "./types";

type Props = {
  articles: Article[];
  date: Date;
  openDrawer: (article: Article) => void;
  isLoading: boolean;
  cursor: PaginationCursor;
  onNextPage: () => void;
  onPrevPage: () => void;
};

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
    openDrawer(article);
  };
  const handlePrevPageClick = () => {
    if (cursor.prev) {
      onPrevPage();
    }
  };
  const handleNextPageClick = () => {
    if (cursor.next) {
      onNextPage();
    }
  };
  const getPaginationClass = (isDisabled: boolean) => {
    const baseClass = "border-solid border-1 border-b-slate-400";
    const disabledClass = "opacity-50 cursor-not-allowed";
    const enabledClass = "cursor-pointer";
    return `${baseClass} ${isDisabled ? disabledClass : enabledClass}`;
  };
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <h1 className="pb-4 text-xl italic">
        - {date.toLocaleDateString("ja-JP")} -
      </h1>
      {articles.length === 0 ? (
        <div className="text-gray-500">記事がありません</div>
      ) : (
        <div data-slot="page-content">
          <div className="flex flex-wrap gap-6">
            {articles.map((article) => (
              <ArticleCard
                key={article.articleId}
                article={article}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className={getPaginationClass(!cursor.prev)}
                  onClick={handlePrevPageClick}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  className={getPaginationClass(!cursor.next)}
                  onClick={handleNextPageClick}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      <LoadingSpinner isLoading={isLoading} />
    </div>
  );
}
