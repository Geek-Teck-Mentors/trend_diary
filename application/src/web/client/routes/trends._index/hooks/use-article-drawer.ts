import { useState } from 'react'
import { Nullable } from '@/common/types/utility'
export default function useArticleDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedArticleId, setSelectedArticleId] = useState<Nullable<string>>(null)

  const open = (articleId: string) => {
    setSelectedArticleId(articleId)
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
    setSelectedArticleId(null)
  }

  return {
    isOpen,
    selectedArticleId,
    open,
    close,
  }
}
