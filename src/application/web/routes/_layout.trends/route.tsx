import React from 'react';
import type { MetaFunction } from '@remix-run/cloudflare';
import TrendsPage from './page';
import useTrends from './useTrends';

export const meta: MetaFunction = () => [{ title: 'トレンド一覧 | TrendDiary' }];

export default function Trends() {
  const { articles, date, selectedArticle, isModalOpen, openModal, closeModal } = useTrends();

  return (
    <TrendsPage
      articles={articles}
      selectedArticle={selectedArticle}
      date={date}
      isModalOpen={isModalOpen}
      openModal={openModal}
      closeModal={closeModal}
    />
  );
}
