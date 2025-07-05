import { useState } from 'react'
import { Article } from './types'

export default function useDrawerState() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  const openDrawer = (article: Article) => {
    setSelectedArticle(article)
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setSelectedArticle(null)
    setIsDrawerOpen(false)
  }

  return {
    isDrawerOpen,
    selectedArticle,
    openDrawer,
    closeDrawer,
  }
}
