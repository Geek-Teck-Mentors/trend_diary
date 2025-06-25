import React from 'react';
import ArticleCard from './components/ArticleCard';
import ArticleModal from './components/ArticleModal';
import { Article, Direction } from './types';
import SpinnerCircle3 from '../../components/customized/spinner/spinner-09';

type Props = {
  articles: Article[];
  fetchArticles: (direction?: Direction) => Promise<void>;
  date: Date;
  selectedArticle: Article | null;
  isModalOpen: boolean;
  openModal: (article: Article) => void;
  closeModal: () => void;
  isLoading: boolean;
};

export default function TrendsPage({
  articles,
  fetchArticles,
  date,
  selectedArticle,
  isModalOpen,
  openModal,
  closeModal,
  isLoading,
}: Props) {
  return (
    <div className='relative min-h-screen bg-gray-50'>
      <div className='min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6'>
        <h1 className='pb-4 text-xl italic'>- {date.toLocaleDateString('ja-JP')} -</h1>
        <div className='flex flex-wrap gap-4'>
          {articles.length === 0 ? (
            <p className='text-gray-500'>記事がありません</p>
          ) : (
            articles.map((article) => (
              <ArticleCard key={article.articleId} article={article} onCardClick={openModal} />
            ))
          )}
        </div>
      </div>
      {isLoading && (
        <div className='absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75'>
          <SpinnerCircle3 />
        </div>
      )}
      <ArticleModal article={selectedArticle} isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
