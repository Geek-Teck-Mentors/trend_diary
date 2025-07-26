import { useState } from 'react'

export type PageErrorType = {
  title: string
  description: string
}

export function usePageError() {
  const [pageError, setPageError] = useState<PageErrorType>()

  const newPageError = (title: string, description: string) => setPageError({ title, description })
  const clearPageError = () => setPageError(undefined)

  return { pageError, newPageError, clearPageError }
}
