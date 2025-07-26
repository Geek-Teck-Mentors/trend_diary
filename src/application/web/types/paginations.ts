export type PaginationDirection = 'next' | 'prev'

export type PaginationCursor = {
  [K in PaginationDirection]?: string
}
