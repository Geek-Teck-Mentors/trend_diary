export type PaginationDirection = 'next' | 'prev';

export type PaginationCursor = {
  [key in PaginationDirection]?: string;
};
