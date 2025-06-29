import type { MetaFunction } from '@remix-run/cloudflare'
import React from 'react'
import SignupPage from './page'
import useSignup from './useSignup'

export const meta: MetaFunction = () => [{ title: 'アカウント作成 | TrendDiary' }]

export default function Signup() {
  const { handleSubmit, errors, isLoading } = useSignup()

  return <SignupPage handleSubmit={handleSubmit} errors={errors} isLoading={isLoading} />
}
