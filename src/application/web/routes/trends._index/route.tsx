import React from 'react';
import type { MetaFunction } from '@remix-run/cloudflare';
import TrendsPage from './page';
import useTrendsState from './useTrendsState';
import useDrawerState from './useDrawerState';
import ArticleDrawer from './components/ArticleDrawer';
import useTrends from './useTrends';
import useObserver from './useObserver';

export const meta: MetaFunction = () => [{ title: 'トレンド一覧 | TrendDiary' }];

export default function Trends() {
  const { articles, fetchArticles, isLoading, cursor } = useTrendsState();
  const { date } = useTrends({ fetchArticles });
  const { observerTargetRef } = useObserver({ fetchArticles, cursor, isLoading });
  const { isDrawerOpen, selectedArticle, openDrawer, closeDrawer } = useDrawerState();

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
        <ArticleDrawer article={selectedArticle} isOpen={isDrawerOpen} onClose={closeDrawer} />
      )}
    </>
  );
}
