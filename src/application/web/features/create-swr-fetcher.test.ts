import { describe, expect, it, vi } from 'vitest'
import { createSWRFetcher } from './create-swr-fetcher'

// モック設定
vi.mock('../infrastructure/api', () => {
  return {
    default: vi.fn(() => ({})),
  }
})

global.fetch = vi.fn()

describe('createSWRFetcher', () => {
  describe('基本動作', () => {
    it('createSWRFetcherが正しくオブジェクトを返す', () => {
      const result = createSWRFetcher()

      expect(result).toBeDefined()
      expect(typeof result.fetcher).toBe('function')
      expect(typeof result.apiCall).toBe('function')
      expect(result.client).toBeDefined()
    })
  })

  describe('fetcher関数', () => {
    it('正常なレスポンスでJSONを返す', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: 'test' }),
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      const { fetcher } = createSWRFetcher()
      const result = await fetcher('http://example.com/api')

      expect(fetch).toHaveBeenCalledWith('http://example.com/api', {
        credentials: 'include',
      })
      expect(result).toEqual({ data: 'test' })
    })

    it('エラーレスポンスで例外を投げる', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      const { fetcher } = createSWRFetcher()

      await expect(fetcher('http://example.com/api')).rejects.toThrow('HTTP 404: Not Found')
    })
  })

  describe('apiCall関数', () => {
    it('正常なレスポンスでJSONを返す', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true }),
      }
      const mockApiFunction = vi.fn().mockResolvedValue(mockResponse)

      const { apiCall } = createSWRFetcher()
      const result = await apiCall(mockApiFunction)

      expect(mockApiFunction).toHaveBeenCalled()
      expect(result).toEqual({ success: true })
    })

    it('エラーレスポンスで例外を投げる', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      }
      const mockApiFunction = vi.fn().mockResolvedValue(mockResponse)

      const { apiCall } = createSWRFetcher()

      await expect(apiCall(mockApiFunction)).rejects.toThrow('HTTP 500: Internal Server Error')
    })
  })
})
