export type CursorDirection = 'next' | 'prev';

export type CursorPaginationParams = {
  cursor?: string;
  limit?: number;
  direction?: CursorDirection;
};

export type CursorPaginationResult<T> = {
  data: T[];
  nextCursor?: string;
  prevCursor?: string;
  hasNext: boolean;
  hasPrev: boolean;
};

export type CursorInfo = {
  id: bigint;
  createdAt: Date;
};
