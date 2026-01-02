import { useState, useCallback } from 'react'
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

  const updateSelectedArticleReadStatus = useCallback((isRead: boolean) => {
    if (selectedArticle == null) return;

    setSelectedArticle({
      ...selectedArticle,
      isRead
    })
  }, [])

  return {
    isOpen,
    selectedArticle,
    updateSelectedArticleReadStatus,
    open,
    close,
  }
}
