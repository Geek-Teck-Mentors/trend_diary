import { useNavigate } from '@remix-run/react'
import { usePageError } from '../../components/PageError/usePageError'
import { AuthenticateFormData } from '../../features/authenticate/validation'
import getApiClientForClient from '../../infrastructure/api'

export default function useSignup() {
  const navigate = useNavigate()
  const { pageError, newPageError, clearPageError } = usePageError()

  const handleSubmit = async (data: AuthenticateFormData) => {
    clearPageError()
    try {
      const client = getApiClientForClient()

      const res = await client.account.$post({
        json: data,
      })

      if (res.status === 201) {
        navigate('/login')
      } else if (res.status === 409) {
        newPageError('認証エラー', 'このメールアドレスは既に使用されています')
      } else if (res.status >= 500) {
        newPageError('サーバーエラー', 'サインアップに失敗しました')
      }
    } catch {
      newPageError('ネットワークエラー', 'ネットワークエラーが発生しました')
    }
  }

  return { handleSubmit, pageError }
}
