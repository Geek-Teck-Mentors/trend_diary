import getApiClientForClient from '../infrastructure/api'

export function createSWRFetcher() {
  const client = getApiClientForClient()

  const apiCall = async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      return await fn()
    } catch (error) {
      // エラーを再スローしてSWRのエラーハンドリングに委ねる
      throw error
    }
  }

  return {
    client,
    apiCall,
  }
}