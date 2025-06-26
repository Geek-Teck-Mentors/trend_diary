import React from 'react';
import ArticleCard from './components/ArticleCard';
import ArticleDrawer from './components/ArticleDrawer';
import { Article } from './types';
import SpinnerCircle3 from '../../components/customized/spinner/spinner-09';

type Props = {
  articles: Article[];
  date: Date;
  selectedArticle: Article | null;
  isDrawerOpen: boolean;
  openDrawer: (article: Article) => void;
  closeDrawer: () => void;
  isLoading: boolean;
  observerTargetRef: React.RefObject<HTMLDivElement>;
};

export default function TrendsPage({
  articles,
  date,
  selectedArticle,
  isDrawerOpen,
  openDrawer,
  closeDrawer,
  isLoading,
  observerTargetRef,
}: Props) {
  const handleCardClick = (article: Article) => {
    openDrawer(article);
  }
  return (
    <div className='relative min-h-screen bg-gray-50'>
      <div className='min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6'>
        <h1 className='pb-4 text-xl italic'>- {date.toLocaleDateString('ja-JP')} -</h1>
        <div className='flex flex-wrap gap-4'>
          {articles.length === 0 ? (
            <p className='text-gray-500'>記事がありません</p>
          ) : (
            articles.map((article) => (
              <ArticleCard key={article.articleId} article={article} onCardClick={handleCardClick} />
            ))
          )}
        </div>
        <div ref={observerTargetRef} className='h-4 w-full' />
      </div>
      {isLoading && (
        <div className='bg-opacity-75 absolute inset-0 flex items-center justify-center bg-gray-50'>
          <SpinnerCircle3 />
        </div>
      )}
      <ArticleDrawer article={selectedArticle!} isOpen={isDrawerOpen} onClose={closeDrawer} />
    </div>
  );
}
