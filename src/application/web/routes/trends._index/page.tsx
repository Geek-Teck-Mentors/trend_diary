import React from "react";
import ArticleCard from "./components/ArticleCard";
import { Article } from "./types";
import LoadingSpinner from "../../components/LoadingSpinner";

import {
  Pagination,
  PaginationContent,
  PaginationNext,
  PaginationPrevious,
  PaginationItem,
} from "@/application/web/components/ui/pagination";

type Props = {
  articles: Article[];
  date: Date;
  openDrawer: (article: Article) => void;
  isLoading: boolean;
  observerTargetRef: React.RefObject<HTMLDivElement>;
};

export default function TrendsPage({
  articles,
  date,
  openDrawer,
  isLoading,
  observerTargetRef,
}: Props) {
  const handleCardClick = (article: Article) => {
    openDrawer(article);
  };
  return (
    <div className='relative min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6'>
      <h1 className='pb-4 text-xl italic'>- {date.toLocaleDateString('ja-JP')} -</h1>
      <div className='flex flex-wrap gap-6'>
        {articles.length === 0 ? (
          <p className='text-gray-500'>記事がありません</p>
        ) : (
          articles.map((article) => (
            <ArticleCard key={article.articleId} article={article} onCardClick={handleCardClick} />
          ))
        )}
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious className="border-solid border-1 border-b-slate-400" />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext className="border-solid border-1 border-b-slate-400" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <LoadingSpinner isLoading={isLoading} />
    </div>
  );
}
