import { useNavigate } from '@remix-run/react'
import useSWRMutation from 'swr/mutation'
import { usePageError } from '../../components/PageError/usePageError'
import { AuthenticateFormData } from '../../features/authenticate/validation'
import { createSWRFetcher } from '../../features/createSWRFetcher'

export default function useSignup() {
  const navigate = useNavigate()
  const { pageError, newPageError, clearPageError } = usePageError()
  const { client, apiCall } = createSWRFetcher()

  const { trigger, isMutating } = useSWRMutation(
    'account/signup',
    async (_key: string, { arg }: { arg: AuthenticateFormData }) => {
      return apiCall(() =>
        client.account.$post({
          json: arg,
        }),
      )
    },
  )

  const handleSubmit = async (data: AuthenticateFormData) => {
    clearPageError()
    try {
      await trigger(data)
      navigate('/login')
    } catch (error: any) {
      if (error.message.includes('409')) {
        newPageError('認証エラー', 'このメールアドレスは既に使用されています')
      } else if (error.message.includes('500')) {
        newPageError('サーバーエラー', 'サインアップに失敗しました')
      } else {
        newPageError('ネットワークエラー', 'ネットワークエラーが発生しました')
      }
    }
  }

  return { handleSubmit, pageError, isLoading: isMutating }
}
