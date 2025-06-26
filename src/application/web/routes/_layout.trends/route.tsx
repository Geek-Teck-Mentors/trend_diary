import React, { useEffect } from 'react';
import type { MetaFunction } from '@remix-run/cloudflare';
import TrendsPage from './page';
import useTrends from './useTrends';
import useDrawerState from './useDrawerState';
import ArticleDrawer from './components/ArticleDrawer';

export const meta: MetaFunction = () => [{ title: 'トレンド一覧 | TrendDiary' }];

export default function Trends() {
  const { isDrawerOpen, selectedArticle, openDrawer, closeDrawer } = useDrawerState();

  const { articles, fetchArticles, date, isLoading, observerTargetRef } = useTrends();

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <>
      <TrendsPage
        articles={articles}
        date={date}
        openDrawer={openDrawer}
        isLoading={isLoading}
        observerTargetRef={observerTargetRef}
      />
      {selectedArticle && (
        <ArticleDrawer article={selectedArticle!} isOpen={isDrawerOpen} onClose={closeDrawer} />
      )}
    </>
  );
}
