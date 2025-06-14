import { Article as PrismaArticle } from '@prisma/client';
import Article from '@/domain/article/article';

export default function fromPrismaToArticle(prismaArticle: PrismaArticle): Article {
  return new Article(
    prismaArticle.articleId,
    prismaArticle.media,
    prismaArticle.title,
    prismaArticle.author,
    prismaArticle.description,
    prismaArticle.url,
    prismaArticle.createdAt,
  );
}
