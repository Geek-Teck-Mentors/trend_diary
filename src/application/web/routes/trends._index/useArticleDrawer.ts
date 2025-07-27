import { useState } from 'react'
import type { ArticleOutput as Article } from '@/domain/article/schema/articleSchema'

export default function useArticleDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  const open = (article: Article) => {
    setSelectedArticle(article)
    setIsOpen(true)
  }

  const close = () => {
    setSelectedArticle(null)
    setIsOpen(false)
  }

  return {
    isOpen,
    selectedArticle,
    open,
    close,
  }
}
