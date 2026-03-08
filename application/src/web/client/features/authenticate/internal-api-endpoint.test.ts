import { describe, expect, it, vi } from 'vitest'
import { resolveInternalApiEndpoint } from './internal-api-endpoint'

describe('resolveInternalApiEndpoint', () => {
  it('INTERNAL_API_ORIGINがある場合はそのオリジンを使う', () => {
    const endpoint = resolveInternalApiEndpoint('/api/v2/auth/login', {
      cloudflare: {
        env: {
          INTERNAL_API_ORIGIN: 'https://trend-diary.example.com',
        },
      },
    })

    expect(endpoint.toString()).toBe('https://trend-diary.example.com/api/v2/auth/login')
  })

  it('開発環境ではINTERNAL_API_ORIGIN未設定でもlocalhostを使う', () => {
    vi.stubEnv('NODE_ENV', 'development')
    try {
      const endpoint = resolveInternalApiEndpoint('/api/v2/auth/signup', {})
      expect(endpoint.toString()).toBe('http://localhost:5173/api/v2/auth/signup')
    } finally {
      vi.unstubAllEnvs()
    }
  })

  it('本番環境でINTERNAL_API_ORIGIN未設定ならエラーにする', () => {
    vi.stubEnv('NODE_ENV', 'production')
    try {
      expect(() => resolveInternalApiEndpoint('/api/v2/auth/login', {})).toThrow(
        'INTERNAL_API_ORIGIN is not configured',
      )
    } finally {
      vi.unstubAllEnvs()
    }
  })
})
