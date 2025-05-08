import React from 'react';
import type { MetaFunction } from '@remix-run/cloudflare';

export const meta: MetaFunction = () => [{ title: 'トレンド記事 | TrendDiary' }];

export default function TrendIndex() {
  return (
    <div className='w-full'>
      <h1 className='bg-black text-2xl text-white'>Trend</h1>
      <ul>
        <li>Remixトレンド</li>
      </ul>
    </div>
  );
}
