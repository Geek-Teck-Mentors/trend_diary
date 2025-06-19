import React from 'react';
import ArticleCard from './_components/ArticleCard';
import ArticleModal from './_components/ArticleModal';
import { Article } from './types';

type Props = {
  articles: Article[];
  date: Date;
  selectedArticle: Article | null;
  isModalOpen: boolean;
  openModal: (article: Article) => void;
  closeModal: () => void;
};

export default function TrendsPage({
  articles,
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
            <ArticleCard key={article.id} article={article} onCardClick={openModal} />
          ))}
        </div>
      </div>

      <ArticleModal article={selectedArticle} isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
