import { useNavigate } from '@remix-run/react'
import { useState } from 'react'

import getApiClientForClient from '../../infrastructure/api'
import {
  AuthenticateErrors,
  AuthenticateFormData,
  validateAuthenticateForm,
} from '../../features/authenticate/validation'
import { PageError } from '../../features/common/page'

export default function useSignup() {
  const navigate = useNavigate()
  const [pageError, setPageError] = useState<PageError>()

  const handleSubmit = async (data: AuthenticateFormData) => {
    try {
      const client = getApiClientForClient()

      const res = await client.account.$post({
        json: data,
      })

      if (res.status === 201) {
        navigate('/login')
      } else if (res.status === 409) {
        setPageError({
          title: '認証エラー',
          description: 'このメールアドレスは既に使用されています',
        })
      } else if (res.status >= 500) {
        setPageError({
          title: 'サーバーエラー',
          description: 'サインアップに失敗しました',
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
