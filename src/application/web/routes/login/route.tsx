import type { MetaFunction } from '@remix-run/cloudflare'
import LoginPage from './page'
import useLogin from './useLogin'

export const meta: MetaFunction = () => [{ title: 'ログイン | TrendDiary' }]

export default function Login() {
  const { handleSubmit, pageError } = useLogin()

  return <LoginPage pageError={pageError} handleSubmit={handleSubmit} />
}
