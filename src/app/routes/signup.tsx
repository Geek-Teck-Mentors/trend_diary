import React from 'react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { Button } from '../../components/ui/button';

export const meta: MetaFunction = () => [{ title: 'Remix and Hono on Vite' }];

export default function Signup() {
  return (
    <div>
      <h1 className='bg-black text-2xl text-white'>Welcome Remix and Hono on Vite</h1>
      <ul>
        <li>Remix</li>
        <li>
          <a href='/hono'>Hono</a>
        </li>
        <li>
          <Button variant='link'>
            <a href='/hono'>Hono</a>
          </Button>
        </li>
      </ul>
    </div>
  );
}
