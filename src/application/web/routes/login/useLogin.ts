import { NavigateFunction } from 'react-router'
import useSWRMutation from 'swr/mutation'
import { usePageError } from '../../components/PageError/usePageError'
import { AuthenticateFormData } from '../../features/authenticate/validation'
import { createSWRFetcher } from '../../features/createSWRFetcher'

export default function useLogin(navigate: NavigateFunction) {
  const { pageError, newPageError, clearPageError } = usePageError()
  const { client, apiCall } = createSWRFetcher()

  const { trigger, isMutating } = useSWRMutation(
    'user/login',
    async (_key: string, { arg }: { arg: AuthenticateFormData }) => {
      return apiCall(() =>
        client.user.login.$post({
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
