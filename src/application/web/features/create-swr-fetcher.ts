import getApiClientForClient from '../infrastructure/api'

export const createSWRFetcher = () => {
  const client = getApiClientForClient()

  const fetcher = async <T>(url: string): Promise<T> => {
    const response = await fetch(url, {
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  const apiCall = async <T>(apiCall: () => Promise<Response>): Promise<T | null> => {
    const response = await apiCall()

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    switch (response.status) {
      case 204:
        return null
      default:
        return response.json()
    }
  }

  return {
    fetcher,
    apiCall,
    client,
  }
}

export default createSWRFetcher
