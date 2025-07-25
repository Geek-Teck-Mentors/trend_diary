import { useState } from 'react'

export type PageError = {
  title: string
  description: string
}

export function usePageError() {
  const [pageError, setPageError] = useState<PageError>()

  const newPageError = (title: string, description: string) => setPageError({ title, description })
  const clearPageError = () => setPageError(undefined)

  return { pageError, newPageError, clearPageError }
}
