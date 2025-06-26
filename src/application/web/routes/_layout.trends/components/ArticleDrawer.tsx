import React from 'react';
import { Calendar, ExternalLink, X } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose
} from '../../../components/ui/drawer';
import QiitaTag from './QiitaTag';
import ZennTag from './ZennTag';
import { Article } from '../types';

type Props = {
  article: Article;
  isOpen: boolean;
  onClose: () => void;
};

export default function ArticleDrawer({ article, isOpen, onClose }: Props) {
  const openOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={openOpenChange} direction="right">
      <DrawerContent className="h-full">
        <DrawerHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex-1">
            {article.media === 'qiita' ? <QiitaTag /> : <ZennTag />}
          </div>
          <DrawerClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <DrawerTitle className='mb-4 text-xl leading-relaxed font-bold text-gray-900'>
            {article.title}
          </DrawerTitle>

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
        </div>

        <div className="p-4 border-t">
          <button
            type='button'
            onClick={() => window.open(article.url, '_blank')}
            className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-600'
          >
            <ExternalLink className='h-4 w-4' />
            記事を読む
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
