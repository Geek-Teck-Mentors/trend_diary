import React, { useEffect } from 'react';
import type { MetaFunction } from '@remix-run/cloudflare';
import TrendsPage from './page';
import useTrends from './useTrends';

export const meta: MetaFunction = () => [{ title: 'トレンド一覧 | TrendDiary' }];

export default function Trends() {
  const { articles, fetchArticles, date, selectedArticle, isDrawerOpen, openModal, closeModal, isLoading, observerTargetRef } = useTrends();

  useEffect(() => { fetchArticles() }, [])

  return (
    <TrendsPage
      articles={articles}
      selectedArticle={selectedArticle}
      date={date}
      isDrawerOpen={isDrawerOpen}
      openModal={openModal}
      closeModal={closeModal}
      isLoading={isLoading}
      observerTargetRef={observerTargetRef}
    />
  );
}
