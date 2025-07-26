import type { MetaFunction } from '@remix-run/cloudflare'
import SignupPage from './page'
import useSignup from './useSignup'

export const meta: MetaFunction = () => [{ title: 'アカウント作成 | TrendDiary' }]

export default function Signup() {
  const { handleSubmit, pageError } = useSignup()

  return <SignupPage handleSubmit={handleSubmit} pageError={pageError} />
}
