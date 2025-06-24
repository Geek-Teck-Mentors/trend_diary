import React from 'react';
import ArticleCard from './components/ArticleCard';
import ArticleModal from './components/ArticleModal';
import { Article, Direction } from './types';

type Props = {
  articles: Article[];
  fetchArticles: (direction?: Direction) => Promise<void>;
  date: Date;
  selectedArticle: Article | null;
  isModalOpen: boolean;
  openModal: (article: Article) => void;
  closeModal: () => void;
};

export default function TrendsPage({
  articles,
  fetchArticles,
  date,
  selectedArticle,
  isModalOpen,
  openModal,
  closeModal,
}: Props) {
  return (
    <div className='relative min-h-screen bg-gray-50'>
      <div className='min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6'>
        <h1 className='pb-4 text-xl italic'>- {date.toLocaleDateString('ja-JP')} -</h1>
        <div className='flex flex-wrap gap-4'>
          {articles.map((article) => (
            <ArticleCard key={article.articleId} article={article} onCardClick={openModal} />
          ))}
        </div>
      </div>

      <ArticleModal article={selectedArticle} isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
