import React from 'react';
import { Card, CardContent } from '@/application/web/components/ui/card';
import MediaTag from './MediaTag';
import { Article } from '../types';

type Props = {
  article: Article;
  onCardClick: (article: Article) => void;
};

export default function ArticleCard({ article, onCardClick }: Props) {
  return (
    <Card
      className="p-6 w-64 h-32 hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/30 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl"
      onClick={() => onCardClick(article)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onCardClick(article);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <CardContent className="p-0 h-full flex flex-col">
        <h3 className="text-sm font-bold text-gray-700 leading-relaxed flex-1 overflow-hidden">
          {article.title}
        </h3>

        <div className="flex justify-between items-end mt-3">
          <span className="text-sm text-gray-600">{article.author}</span>
          <MediaTag media={article.media} />
        </div>
      </CardContent>
    </Card>
  );
}
