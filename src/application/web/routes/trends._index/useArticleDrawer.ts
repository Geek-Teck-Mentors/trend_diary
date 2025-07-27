import { useState } from 'react'
import type { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'
import { Nullable } from '@/common/types/utility'

export default function useArticleDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<Nullable<Article>>(null)

  const open = (article: Article) => {
    setSelectedArticle(article)
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
    setSelectedArticle(null)
  }

  return {
    isOpen,
    selectedArticle,
    open,
    close,
  }
}
