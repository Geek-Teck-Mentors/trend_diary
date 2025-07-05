import React from 'react';
import type { MetaFunction } from '@remix-run/cloudflare';
import TrendsPage from './page';
import useTrendsState from './useTrendsState';
import useDrawerState from './useDrawerState';
import ArticleDrawer from './components/ArticleDrawer';
import useTrends from './useTrends';

export const meta: MetaFunction = () => [{ title: 'トレンド一覧 | TrendDiary' }];

export default function Trends() {
  const { articles, fetchArticles, isLoading, cursor } = useTrendsState();
  const { date, handleNextPage, handlePrevPage } = useTrends({ fetchArticles, cursor });
  const { isDrawerOpen, selectedArticle, openDrawer, closeDrawer } = useDrawerState();

  return (
    <>
      <TrendsPage
        articles={articles}
        date={date}
        openDrawer={openDrawer}
        isLoading={isLoading}
        cursor={cursor}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
      />
      {selectedArticle && (
        <ArticleDrawer article={selectedArticle} isOpen={isDrawerOpen} onClose={closeDrawer} />
      )}
    </>
  );
}
