import { Calendar, Check, ExternalLink, User, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { toJaDateString } from '@/common/locale'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/web/client/components/shadcn/drawer'
import type { Article } from '../hooks/use-trends'
import MediaIcon from './media-icon'

type Props = {
  article: Article
  isOpen: boolean
  onClose: () => void
  onMarkAsRead?: (articleId: string) => void | Promise<void>
  onToggleRead?: (articleId: string, isRead: boolean) => void
  isLoggedIn?: boolean
}

export default function ArticleDrawer({
  article,
  isOpen,
  onClose,
  onMarkAsRead,
  onToggleRead,
  isLoggedIn = false,
}: Props) {
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  const isRead = article.isRead ?? false
  const media = article.media === 'qiita' ? 'qiita' : 'zenn'

  const handleReadArticle = () => {
    // ポップアップブロッカー対策として、先にウィンドウを開く
    window.open(article.url, '_blank', 'noopener,noreferrer')
    if (isLoggedIn) {
      // onMarkAsReadはawaitせず、バックグラウンドで実行
      onMarkAsRead?.(article.articleId)
    }
  }

  const handleToggleRead = () => {
    onToggleRead?.(article.articleId, !isRead)
  }

  return createPortal(
    <Drawer open={isOpen} onOpenChange={handleOpenChange} direction='right'>
      <DrawerContent className='h-full w-3/4 md:w-1/2'>
        <DrawerHeader className='flex flex-row items-center justify-between pb-4'>
          <div className='flex flex-1 items-center gap-2' data-slot='drawer-header-icon'>
            <MediaIcon media={media} />
            {isRead && (
              <span
                data-testid='drawer-read-indicator'
                className='inline-flex items-center text-green-600'
              >
                <Check className='h-4 w-4' />
                <span className='ml-1 text-sm'>既読</span>
              </span>
            )}
          </div>
          <DrawerClose className='ring-offset-background focus:ring-ring cursor-pointer rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none'>
            <X className='size-4' data-slot='x-icon' />
            <span className='sr-only'>Close</span>
          </DrawerClose>
        </DrawerHeader>

        {/* Drawer内では文字選択とドラッグしてDrawerを閉じるアクションがバッティングする */}
        {/* data-vaul-no-dragをfalseに指定し、ドラッグしてDrawerが閉じないように */}
        <div className='flex-1 overflow-y-auto px-4 select-text' data-vaul-no-drag={false}>
          <DrawerTitle className='mb-4 text-xl leading-relaxed font-bold text-gray-900'>
            {article.title}
          </DrawerTitle>

          <div
            className='mb-6 flex items-center gap-4 text-sm text-gray-600'
            data-slot='drawer-content-meta'
          >
            <div className='flex items-center gap-1'>
              <Calendar className='size-4' />
              <span>{toJaDateString(article.createdAt)}</span>
            </div>
          </div>

          <div className='flex items-center gap-1 mb-6' data-slot='drawer-content-author'>
            <User className='size-4' />
            <span className='text-sm font-medium text-gray-700'>{article.author}</span>
          </div>

          <div className='mb-8' data-slot='drawer-content-description'>
            <h3 className='mb-3 text-lg font-semibold text-gray-900'>記事の概要</h3>
            <p
              className='leading-relaxed text-gray-700'
              data-slot='drawer-content-description-content'
            >
              {article.description}
            </p>
          </div>
        </div>

        <div className='border-t p-4 space-y-3'>
          <button
            type='button'
            onClick={handleReadArticle}
            className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-600'
            data-slot='drawer-content-button'
          >
            <ExternalLink className='size-4' />
            記事を読む
          </button>
          {isLoggedIn && (
            <button
              type='button'
              onClick={handleToggleRead}
              className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100'
            >
              {isRead ? '未読に戻す' : '既読にする'}
            </button>
          )}
        </div>
      </DrawerContent>
    </Drawer>,
    document.body,
  )
}
