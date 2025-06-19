import React from 'react';
import { Calendar, ExternalLink } from 'lucide-react';
import RightSidebarModal from '../../../components/RightSidebarModal';
import MediaTag from './MediaTag';
import { Article } from '../types';

type Props = {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function ArticleModal({ article, isOpen, onClose }: Props) {
  if (!article) return null;

  return (
    <RightSidebarModal isOpen={isOpen} onClose={onClose} showCloseButton>
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <MediaTag media={article.media} />
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4 leading-relaxed">
        {article.title}
      </h2>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{article.createdAt.toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mb-6">
        <span className="text-sm font-medium text-gray-700">{article.author}</span>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">記事の概要</h3>
        <p className="text-gray-700 leading-relaxed">
          {article.description}
        </p>
      </div>

      <button
        type="button"
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        <ExternalLink className="w-4 h-4" />
        記事を読む
      </button>
    </RightSidebarModal>
  );
}
