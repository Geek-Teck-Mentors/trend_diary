import { useNavigate } from '@remix-run/react'
import { usePageError } from '../../components/PageError/usePageError'
import { AuthenticateFormData } from '../../features/authenticate/validation'
import getApiClientForClient from '../../infrastructure/api'

export default function useLogin() {
  const navigate = useNavigate()
  const { pageError, newPageError, clearPageError } = usePageError()

  const handleSubmit = async (data: AuthenticateFormData) => {
    clearPageError()
    try {
      const client = getApiClientForClient()

      const res = await client.account.login.$post({
        json: {
          email: data.email,
          password: data.password,
        },
      })

      if (res.status === 200) {
        navigate('/trends')
      } else if (res.status === 401 || res.status === 404) {
        newPageError('認証エラー', 'メールアドレスまたはパスワードが正しくありません')
      } else if (res.status >= 500) {
        newPageError('サーバーエラー', '不明なエラーが発生しました')
      }
    } catch {
      newPageError('ネットワークエラー', 'ネットワークエラーが発生しました')
    }
  }

  return { handleSubmit, pageError }
}
