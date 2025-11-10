import { NavigateFunction } from 'react-router'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'
import { createSWRFetcher } from '../../features/create-swr-fetcher'

export default function useSidebar(navigate: NavigateFunction) {
  const { client, apiCall } = createSWRFetcher()

  const { trigger, isMutating } = useSWRMutation(
    'v2/auth/logout',
    async () => {
      return apiCall(() => client.v2.auth.logout.$delete())
    },
    {
      onSuccess: () => {
        navigate('/login')
        toast.success('ログアウトしました')
      },
      onError: () => {
        toast.error('ログアウトに失敗しました')
      },
    },
  )

  const handleLogout = async () => {
    trigger()
  }

  return { handleLogout, isLoading: isMutating }
}
