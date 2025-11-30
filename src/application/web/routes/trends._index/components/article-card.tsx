import { Check } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/application/web/components/shadcn/card'
import type { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'
import MediaIcon from './media-icon'

type Props = {
  article: Article
  onCardClick: (article: Article) => void
}

export default function ArticleCard({ article, onCardClick }: Props) {
  return (
    <Card
      data-slot='card'
      className='relative h-32 w-full sm:w-64 cursor-pointer rounded-3xl border border-white/40 bg-white/30 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-xl'
      onClick={() => onCardClick(article)}
      role='button'
      tabIndex={0}
    >
      {article.hasRead && (
        <div
          className='absolute top-2 right-2 flex items-center justify-center rounded-full bg-green-500 p-1'
          data-slot='read-badge'
        >
          <Check className='size-4 text-white' />
        </div>
      )}
      <CardContent className='flex h-full flex-col p-0'>
        <CardTitle className='line-clamp-2 flex-1 overflow-hidden text-sm leading-relaxed font-bold text-gray-700'>
          <MediaIcon media={article.media === 'qiita' ? 'qiita' : 'zenn'} />
          <span>{article.title}</span>
        </CardTitle>

        <CardDescription className='mt-3 flex items-end justify-between'>
          <span className='text-sm text-gray-600'>{article.author}</span>
        </CardDescription>
      </CardContent>
    </Card>
  )
}
