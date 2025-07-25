import { useNavigate } from '@remix-run/react'
import { useState } from 'react'
import getApiClientForClient from '../../infrastructure/api'
import { AuthenticateFormData } from '../../features/authenticate/validation'
import { PageError } from '../../features/common/page'

export default function useLogin() {
  const navigate = useNavigate()
  const [pageError, setPageError] = useState<PageError>()

  const handleSubmit = async (data: AuthenticateFormData) => {
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
        setPageError({
          title: '認証エラー',
          description: 'メールアドレスまたはパスワードが正しくありません',
        })
      } else if (res.status >= 500) {
        setPageError({
          title: 'サーバーエラー',
          description: '不明なエラーが発生しました',
        })
      }
    } catch {
      setPageError({
        title: 'ネットワークエラー',
        description: 'ネットワークエラーが発生しました',
      })
    }
  }

  return { handleSubmit, pageError }
}
