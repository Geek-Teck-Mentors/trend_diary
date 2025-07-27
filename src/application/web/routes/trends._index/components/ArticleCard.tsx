import { useCallback } from 'react'
import { Card, CardContent, CardDescription, CardTitle } from '@/application/web/components/ui/card'
import type { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'
import MediaIcon from './MediaIcon'

type Props = {
  article: Article
  onCardClick: (article: Article) => void
}

export default function ArticleCard({ article, onCardClick }: Props) {
  return (
    <Card
      className='h-32 w-64 cursor-pointer rounded-3xl border border-white/40 bg-white/30 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-xl'
      onClick={() => onCardClick(article)}
      role='button'
      tabIndex={0}
    >
      <CardContent className='flex h-full flex-col p-0'>
        <CardTitle className='line-clamp-2 flex-1 overflow-hidden text-sm leading-relaxed font-bold text-gray-700'>
          <MediaIcon media={article.media === 'qiita' ? 'qiita' : 'zenn'} />
          <span data-slot='card-title-content'>{article.title}</span>
        </CardTitle>

        <CardDescription className='mt-3 flex items-end justify-between'>
          <span className='text-sm text-gray-600' data-slot='card-description-author'>
            {article.author}
          </span>
        </CardDescription>
      </CardContent>
    </Card>
  )
}
