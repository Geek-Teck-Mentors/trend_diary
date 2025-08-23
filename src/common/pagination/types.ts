export type CursorDirection = 'next' | 'prev'

export interface CursorPaginationResult<T> {
  data: T[]
  nextCursor?: string
  prevCursor?: string
  hasNext: boolean
  hasPrev: boolean
}

export interface CursorInfo {
  id: bigint
  createdAt: Date
}

export interface OffsetPaginationResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}
