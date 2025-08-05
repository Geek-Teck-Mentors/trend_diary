export type CursorDirection = 'next' | 'prev'

export type CursorPaginationParams = {
  cursor?: string
  limit?: number
  direction?: CursorDirection
}

export type CursorPaginationResult<T> = {
  data: T[]
  nextCursor?: string
  prevCursor?: string
  hasNext: boolean
  hasPrev: boolean
}

export type CursorInfo = {
  id: bigint
  createdAt: Date
}

export type OffsetPaginationParams = {
  page?: number
  limit?: number
}

export type OffsetPaginationResult<T> = {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}
