import { useState } from 'react';
import { toast } from 'sonner';
import { Article, Cursor, Direction } from './types';
import getApiClientForClient from '../../infrastructure/api';

const date = new Date();

export default function useTrends() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [cursor, setCursor] = useState<Cursor>({});
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchArticles = async (direction: Direction = 'next') => {
    try {
      const client = getApiClientForClient();

      const res = await client.articles.$get({
        query: {
          direction,
          cursor: cursor[direction],
          limit: 10,
        }
      })
      if (res.status === 200) {
        const resJson = await res.json();
        setArticles([
          ...articles,
          ...resJson.data.map((data) => ({
            articleId: Number(data.articleId),
            media: data.media,
            title: data.title,
            author: data.author,
            description: data.description,
            url: data.url,
            createdAt: new Date(data.createdAt),
          }))
        ]);
        setCursor({
          next: resJson.nextCursor,
          prev: resJson.prevCursor,
        });
      } else {
        toast.error('エラーが発生しました')
      }
    } catch (error) {
      toast.error('エラーが発生しました')
    }
  };

  const openModal = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedArticle(null), 300);
  };

  return {
    articles,
    fetchArticles,
    date,
    selectedArticle,
    isModalOpen,
    openModal,
    closeModal,
  };
}
