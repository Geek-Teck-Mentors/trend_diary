import getApiClientForClient from '../infrastructure/api'

export const createSWRFetcher = () => {
  const client = getApiClientForClient()

  const fetcher = async (url: string) => {
    const response = await fetch(url, {
      credentials: 'include',
      mode: 'cors',
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  const apiCall = async <T>(apiCall: () => Promise<Response>): Promise<T> => {
    const response = await apiCall()

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  return {
    fetcher,
    apiCall,
    client,
  }
}

export default createSWRFetcher
