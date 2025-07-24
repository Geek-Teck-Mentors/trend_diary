import { useNavigate } from '@remix-run/react'
import { useState } from 'react'
import getApiClientForClient from '../../infrastructure/api'
import { AuthenticateErrors, validateAuthenticateForm } from '../../validation/authenticateForm'

export default function useLogin() {
  const navigate = useNavigate()
  const [errors, setErrors] = useState<AuthenticateErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    const validation = validateAuthenticateForm(formData)

    if (!validation.isValid) {
      setErrors(validation.errors)
      setIsLoading(false)
      return
    }

    try {
      const client = getApiClientForClient()

      const res = await client.account.login.$post({
        json: { email: validation.data?.email, password: validation.data?.password },
      })

      if (res.status === 200) {
        console.log('Login success')
        navigate('/trends')
      } else if (res.status === 401 || res.status === 404) {
        console.error('Login failed: Invalid credentials', { status: res.status })
        setErrors({
          email: ['メールアドレスまたはパスワードが正しくありません。'],
        })
      } else {
        console.error('Login failed: Unexpected status', { status: res.status })
        setErrors({
          email: ['ログインに失敗しました。'],
        })
      }
    } catch {
      setErrors({
        email: ['ネットワークエラーが発生しました'],
      })
    } finally {
      setIsLoading(false)
    }
  }

  return { handleSubmit, errors, isLoading }
}
