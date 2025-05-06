import React from 'react';
import type { MetaFunction } from '@remix-run/cloudflare';

export const meta: MetaFunction = () => [{ title: 'Remix and Hono on Vite' }];

export default function TrendIndex() {
  return (
    <div>
      <h1 className='bg-black text-2xl text-white'>Trend</h1>
      <ul>
        <li>Remixトレンド</li>
      </ul>
    </div>
  );
}
