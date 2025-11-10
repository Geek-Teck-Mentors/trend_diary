import { NavigateFunction } from 'react-router'
import useSWRMutation from 'swr/mutation'
import { usePageError } from '../../components/page-error/use-page-error'
import { AuthenticateFormData } from '../../features/authenticate/validation'
import { createSWRFetcher } from '../../features/create-swr-fetcher'

export default function useSignup(navigate: NavigateFunction) {
  const { pageError, newPageError, clearPageError } = usePageError()
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
          newPageError('認証エラー', 'このメールアドレスは既に使用されています')
        } else if (error.message.includes('500')) {
          newPageError('サーバーエラー', 'サインアップに失敗しました')
        } else {
          newPageError('ネットワークエラー', 'ネットワークエラーが発生しました')
        }
      },
    },
  )

  const handleSubmit = async (data: AuthenticateFormData) => {
    clearPageError()
    trigger(data)
  }

  return { handleSubmit, pageError, isLoading: isMutating }
}
