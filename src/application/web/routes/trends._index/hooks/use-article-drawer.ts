import { useState } from 'react'
import { Nullable } from '@/common/types/utility'
import type { Article } from './use-trends'

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

  const syncSelectedArticle = (articles: Article[]) => {
    if (!selectedArticle) return

    const updatedArticle = articles.find((a) => a.articleId === selectedArticle.articleId)
    if (updatedArticle) {
      setSelectedArticle(updatedArticle)
    }
  }

  return {
    isOpen,
    selectedArticle,
    open,
    close,
    syncSelectedArticle,
  }
}
