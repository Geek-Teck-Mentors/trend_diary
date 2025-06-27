import React, { useCallback } from 'react';
import { Card, CardContent } from '@/application/web/components/ui/card';
import QiitaTag from './QiitaTag';
import ZennTag from './ZennTag';
import { Article } from '../types';

type Props = {
  article: Article;
  onCardClick: (article: Article) => void;
};

export default React.memo(({ article, onCardClick }: Props) => {
  const handleClick = useCallback(() => {
    onCardClick(article);
  }, [article, onCardClick]);

  return (
    <Card
      className='h-32 w-64 cursor-pointer rounded-3xl border border-white/40 bg-white/30 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-xl'
      onClick={handleClick}
      role='button'
      tabIndex={0}
    >
      <CardContent className='flex h-full flex-col p-0'>
        <h3 className='flex-1 overflow-hidden text-sm leading-relaxed font-bold text-ellipsis text-gray-700'>
          {article.title}
        </h3>

        <div className='mt-3 flex items-end justify-between'>
          <span className='text-sm text-gray-600'>{article.author}</span>
          {article.media === 'qiita' ? <QiitaTag /> : <ZennTag />}
        </div>
      </CardContent>
    </Card>
  );
});
