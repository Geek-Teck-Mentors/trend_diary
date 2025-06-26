import React, { useEffect } from 'react';
import type { MetaFunction } from '@remix-run/cloudflare';
import TrendsPage from './page';
import useTrends from './useTrends';
import useDrawerState from './useDrawerState';

export const meta: MetaFunction = () => [{ title: 'トレンド一覧 | TrendDiary' }];

export default function Trends() {
  const {
    isDrawerOpen,
    selectedArticle,
    openDrawer,
    closeDrawer,
  } = useDrawerState();

  const {
    articles,
    fetchArticles,
    date,
    isLoading,
    observerTargetRef,
  } = useTrends();

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <TrendsPage
      articles={articles}
      selectedArticle={selectedArticle}
      date={date}
      isDrawerOpen={isDrawerOpen}
      openDrawer={openDrawer}
      closeDrawer={closeDrawer}
      isLoading={isLoading}
      observerTargetRef={observerTargetRef}
    />
  );
}
