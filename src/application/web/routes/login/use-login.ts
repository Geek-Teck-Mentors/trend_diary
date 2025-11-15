import { NavigateFunction } from 'react-router'
import useSWRMutation from 'swr/mutation'
import { usePageError } from '../../components/ui/page-error/use-page-error'
import { AuthenticateFormData } from '../../features/authenticate/validation'
import { createSWRFetcher } from '../../features/create-swr-fetcher'

export default function useLogin(navigate: NavigateFunction) {
  const { pageError, newPageError, clearPageError } = usePageError()
  const { client, apiCall } = createSWRFetcher()

  const { trigger, isMutating } = useSWRMutation(
    'v2/auth/login',
    async (_key: string, { arg }: { arg: AuthenticateFormData }) => {
      return apiCall(() =>
        client.v2.auth.login.$post({
          json: {
            email: arg.email,
            password: arg.password,
          },
        }),
      )
    },
    {
      onSuccess: () => {
        navigate('/trends')
      },
      onError: (error: Error) => {
        if (error.message.includes('401') || error.message.includes('404')) {
          newPageError('認証エラー', 'メールアドレスまたはパスワードが正しくありません')
        } else if (error.message.includes('500')) {
          newPageError('サーバーエラー', '不明なエラーが発生しました')
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
