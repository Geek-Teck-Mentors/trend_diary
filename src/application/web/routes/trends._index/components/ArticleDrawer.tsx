import { Calendar, ExternalLink, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { AnchorLink, ExternalPath } from '@/application/web/components/link'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/application/web/components/ui/drawer'
import type { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'
import MediaIcon from './MediaIcon'

type Props = {
  article: Article
  isOpen: boolean
  onClose: () => void
}

export default function ArticleDrawer({ article, isOpen, onClose }: Props) {
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  const media = article.media === 'qiita' ? 'qiita' : 'zenn'

  return createPortal(
    <Drawer open={isOpen} onOpenChange={handleOpenChange} direction='right'>
      <DrawerContent className='h-full w-1/2'>
        <DrawerHeader className='flex flex-row items-center justify-between pb-4'>
          <div className='flex-1'>
            <MediaIcon media={media} />
          </div>
          <DrawerClose className='ring-offset-background focus:ring-ring cursor-pointer rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none'>
            <X className='h-4 w-4' />
            <span className='sr-only'>Close</span>
          </DrawerClose>
        </DrawerHeader>

        <div className='flex-1 overflow-y-auto px-4'>
          <DrawerTitle className='mb-4 text-xl leading-relaxed font-bold text-gray-900'>
            {article.title}
          </DrawerTitle>
          <DrawerDescription className='sr-only'>記事の詳細情報を表示しています</DrawerDescription>

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

        <div className='border-t p-4'>
          <AnchorLink
            to={article.url as ExternalPath}
            className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-600'
            data-slot='drawer-content-link'
          >
            <ExternalLink className='h-4 w-4' />
            記事を読む
          </AnchorLink>
        </div>
      </DrawerContent>
    </Drawer>,
    document.body,
  )
}
