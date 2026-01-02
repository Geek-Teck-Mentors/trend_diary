import { NavigateFunction } from 'react-router'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'
import { AuthenticateFormData } from '../../features/authenticate/validation'
import { createSWRFetcher } from '../../features/create-swr-fetcher'

export default function useSignup(navigate: NavigateFunction) {
  const { client, apiCall } = createSWRFetcher()

  const { trigger, isMutating } = useSWRMutation(
    'v2/auth/signup',
    async (_key: string, { arg }: { arg: AuthenticateFormData }) => {
      return apiCall(() =>
        client.v2.auth.signup.$post({
          json: arg,
        }),
      )
    },
    {
      onSuccess: () => {
        navigate('/login')
      },
      onError: (error: Error) => {
        if (error.message.includes('409')) {
          toast.error('このメールアドレスは既に使用されています')
        } else if (error.message.includes('500')) {
          toast.error('サーバーエラーが発生しました。時間をおいて再度お試しください。')
        } else {
          toast.error('予期せぬエラーが発生しました。')
        }
      },
    },
  )

  const handleSubmit = async (data: AuthenticateFormData) => {
    trigger(data)
  }

  return { handleSubmit, isLoading: isMutating }
}
