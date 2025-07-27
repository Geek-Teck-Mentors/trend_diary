import { useNavigate } from '@remix-run/react'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'
import { createSWRFetcher } from '../../features/createSWRFetcher'

export default function useSidebar() {
  const navigate = useNavigate()
  const { client, apiCall } = createSWRFetcher()

  const { trigger, isMutating } = useSWRMutation(
    'account/logout',
    async () => {
      return apiCall(() => client.account.logout.$delete())
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
