import { CursorPaginationResult } from '@/common/pagination';
import { ArticleOutput } from '@/domain/article/schema/articleSchema';

export type ArticleResponse = ArticleOutput;

export type ArticleListResponse = CursorPaginationResult<ArticleResponse>;
