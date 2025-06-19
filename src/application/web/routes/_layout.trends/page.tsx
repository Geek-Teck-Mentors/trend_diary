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
  closeModal
}: Props) {
  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
        <h1 className="text-xl pb-4 italic">- {date.toLocaleDateString('ja-JP')} -</h1>
        <div className="flex flex-wrap gap-4">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onCardClick={openModal}
            />
          ))}
        </div>
      </div>

      <ArticleModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
