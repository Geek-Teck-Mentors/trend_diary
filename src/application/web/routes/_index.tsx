import React from 'react'
import type { MetaFunction } from '@remix-run/cloudflare'

export const meta: MetaFunction = () => [{ title: 'Remix and Hono on Vite' }]

export const loader = async () => Response.json({})

export default function Index() {
  return (
    <div>
      <h1 className='bg-black text-2xl text-white'>Welcome Remix and Hono on Vite</h1>
      <ul>
        <li>Remix</li>
        <li>
          <a href='/hono'>Hono</a>
        </li>
      </ul>
    </div>
  )
}
