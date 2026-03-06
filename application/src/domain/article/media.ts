export const ARTICLE_MEDIA = ['qiita', 'zenn', 'hatena'] as const

export type ArticleMedia = (typeof ARTICLE_MEDIA)[number]

export function isArticleMedia(value: string): value is ArticleMedia {
  return (ARTICLE_MEDIA as readonly string[]).includes(value)
}
