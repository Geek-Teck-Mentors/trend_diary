import { CursorDirection, CursorInfo, CursorPaginationResult } from './types'

export function encodeCursor(info: CursorInfo): string {
  return Buffer.from(
    JSON.stringify({
      id: info.id.toString(),
      createdAt: info.createdAt.toISOString(),
    }),
  ).toString('base64')
}

export function decodeCursor(cursor: string): CursorInfo {
  try {
    const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString())
    return {
      id: BigInt(decoded.id),
      createdAt: new Date(decoded.createdAt),
    }
  } catch {
    throw new Error('Invalid cursor format')
  }
}

export function createPaginationResult<T extends { createdAt: Date }>(
  data: T[],
  limit: number,
  getId: (item: T) => bigint,
  direction: CursorDirection = 'next',
  hasCursor: boolean = false,
): CursorPaginationResult<T> {
  const hasMore = data.length > limit
  const items = hasMore ? data.slice(0, limit) : data

  const result: CursorPaginationResult<T> = {
    data: items,
    hasNext: false,
    hasPrev: false,
    nextCursor: undefined,
    prevCursor: undefined,
  }

  if (items.length === 0) {
    return result
  }

  if (direction === 'next') {
    result.hasNext = hasMore
    result.hasPrev = hasCursor

    if (result.hasNext) {
      const lastItem = items[items.length - 1]
      result.nextCursor = encodeCursor({
        id: getId(lastItem),
        createdAt: lastItem.createdAt,
      })
    }

    if (result.hasPrev) {
      const firstItem = items[0]
      result.prevCursor = encodeCursor({
        id: getId(firstItem),
        createdAt: firstItem.createdAt,
      })
    }
  } else {
    result.hasPrev = hasMore
    result.hasNext = true

    if (result.hasPrev) {
      const firstItem = items[0]
      result.prevCursor = encodeCursor({
        id: getId(firstItem),
        createdAt: firstItem.createdAt,
      })
    }

    const lastItem = items[items.length - 1]
    result.nextCursor = encodeCursor({
      id: getId(lastItem),
      createdAt: lastItem.createdAt,
    })
  }

  return result
}
