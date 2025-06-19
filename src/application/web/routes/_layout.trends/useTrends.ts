import { useState } from 'react';
import { Article } from './types';

const articles: Article[] = [
  {
    id: 1,
    title: 'テストタイトル1',
    author: '@test',
    media: 'zenn',
    description:
      'テストタイトル1の内容です。WebSocketを使用したリアルタイム通信の実装について詳しく解説します。',
    url: 'https://example.com/article1',
    createdAt: new Date('2023-10-01T12:00:00Z'),
  },
  {
    id: 2,
    title: 'テストタイトル2',
    author: '@test',
    media: 'zenn',
    description:
      'テストタイトル2の内容です。WebSocketを使用したリアルタイム通信の実装について詳しく解説します。',
    url: 'https://example.com/article1',
    createdAt: new Date('2023-10-01T12:00:00Z'),
  },
  {
    id: 3,
    title: 'テストタイトル3',
    author: '@test',
    media: 'zenn',
    description:
      'テストタイトル3の内容です。WebSocketを使用したリアルタイム通信の実装について詳しく解説します。',
    url: 'https://example.com/article1',
    createdAt: new Date('2023-10-01T12:00:00Z'),
  },
  {
    id: 4,
    title: 'テストタイトル4',
    author: '@test',
    media: 'qiita',
    description:
      'テストタイトル4の内容です。WebSocketを使用したリアルタイム通信の実装について詳しく解説します。',
    url: 'https://example.com/article1',
    createdAt: new Date('2023-10-01T12:00:00Z'),
  },
  {
    id: 5,
    title: 'テストタイトル5',
    author: '@test',
    media: 'qiita',
    description:
      'テストタイトル5の内容です。WebSocketを使用したリアルタイム通信の実装について詳しく解説します。',
    url: 'https://example.com/article1',
    createdAt: new Date('2023-10-01T12:00:00Z'),
  },
  {
    id: 6,
    title: 'テストタイトル6',
    author: '@test',
    media: 'qiita',
    description:
      'テストタイトル6の内容です。WebSocketを使用したリアルタイム通信の実装について詳しく解説します。',
    url: 'https://example.com/article1',
    createdAt: new Date('2023-10-01T12:00:00Z'),
  },
  {
    id: 7,
    title: 'テストタイトル7',
    author: '@test',
    media: 'zenn',
    description:
      'テストタイトル7の内容です。WebSocketを使用したリアルタイム通信の実装について詳しく解説します。',
    url: 'https://example.com/article1',
    createdAt: new Date('2023-10-01T12:00:00Z'),
  },
  {
    id: 8,
    title: 'テストタイトル8',
    author: '@test',
    media: 'zenn',
    description:
      'テストタイトル8の内容です。WebSocketを使用したリアルタイム通信の実装について詳しく解説します。',
    url: 'https://example.com/article1',
    createdAt: new Date('2023-10-01T12:00:00Z'),
  },
];

const date = new Date();

export default function useTrends() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    date,
    selectedArticle,
    isModalOpen,
    openModal,
    closeModal,
  };
}
