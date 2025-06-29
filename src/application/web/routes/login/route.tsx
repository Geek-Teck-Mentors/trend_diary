import type { MetaFunction } from '@remix-run/cloudflare'
import React from 'react'
import LoginPage from './page'
import useLogin from './useLogin'

export const meta: MetaFunction = () => [{ title: 'ログイン | TrendDiary' }]

export default function Login() {
  const { handleSubmit, errors, isLoading } = useLogin()

  return <LoginPage handleSubmit={handleSubmit} errors={errors} isLoading={isLoading} />
}
