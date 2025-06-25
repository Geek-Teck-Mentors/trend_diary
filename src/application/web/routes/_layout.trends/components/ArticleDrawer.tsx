import React from 'react';
import { Calendar, ExternalLink } from 'lucide-react';
import RightSidebarModal from '../../../components/RightSidebarModal';
import QiitaTag from './QiitaTag';
import ZennTag from './ZennTag';
import { Article } from '../types';

type Props = {
  article: Article;
  isOpen: boolean;
  onClose: () => void;
};

export default function ArticleDrawer({ article, isOpen, onClose }: Props) {
  return (
    <RightSidebarModal isOpen={isOpen} onClose={onClose} showCloseButton>
      <div className='mb-6 flex items-start justify-between'>
        <div className='flex-1'>
          {article.media === 'qiita' ? <QiitaTag /> : <ZennTag />}
        </div>
      </div>

      <h2 className='mb-4 text-xl leading-relaxed font-bold text-gray-900'>{article.title}</h2>

      <div className='mb-6 flex items-center gap-4 text-sm text-gray-600'>
        <div className='flex items-center gap-1'>
          <Calendar className='h-4 w-4' />
          <span>{article.createdAt.toLocaleDateString()}</span>
        </div>
      </div>

      <div className='mb-6'>
        <span className='text-sm font-medium text-gray-700'>{article.author}</span>
      </div>

      <div className='mb-8'>
        <h3 className='mb-3 text-lg font-semibold text-gray-900'>記事の概要</h3>
        <p className='leading-relaxed text-gray-700'>{article.description}</p>
      </div>

      <button
        type='button'
        onClick={() => window.open(article.url, '_blank')}
        className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-600'
      >
        <ExternalLink className='h-4 w-4' />
        記事を読む
      </button>
    </RightSidebarModal>
  );
}
