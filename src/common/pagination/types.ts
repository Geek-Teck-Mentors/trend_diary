export type CursorDirection = 'next' | 'prev'

interface BaseResult<T> {
  data: T[]
  hasNext: boolean
  hasPrev: boolean
}

export interface CursorPaginationResult<T> extends BaseResult<T> {
  nextCursor?: string
  prevCursor?: string
}

export interface CursorInfo {
  id: bigint
  createdAt: Date
}

export interface OffsetPaginationResult<T> extends BaseResult<T> {
  page: number
  limit: number
  total: number
  totalPages: number
}
