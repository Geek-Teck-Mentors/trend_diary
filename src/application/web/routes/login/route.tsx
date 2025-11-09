import { LoaderFunctionArgs, type MetaFunction, redirect, useNavigate } from 'react-router'
import { isUserFeatureEnabled } from '../../features/feature-flag'
import LoginPage from './page'
import useLogin from './useLogin'

export const meta: MetaFunction = () => [
  { title: 'ログイン | TrendDiary' },
  {
    name: 'description',
    content:
      'TrendDiaryにログインして、技術トレンドの管理を始めましょう。Qiita、Zennの記事を効率的に管理できます。',
  },
  { property: 'og:title', content: 'ログイン | TrendDiary' },
  {
    property: 'og:description',
    content:
      'TrendDiaryにログインして、技術トレンドの管理を始めましょう。Qiita、Zennの記事を効率的に管理できます。',
  },
  { property: 'og:url', content: '/login' },
  { name: 'twitter:title', content: 'ログイン | TrendDiary' },
  {
    name: 'twitter:description',
    content:
      'TrendDiaryにログインして、技術トレンドの管理を始めましょう。Qiita、Zennの記事を効率的に管理できます。',
  },
]

export async function loader({ context }: LoaderFunctionArgs) {
  const env = context.cloudflare?.env
  if (!isUserFeatureEnabled(env)) {
    throw redirect('/?error=user_feature_disabled')
  }
  return null
}

export default function Login() {
  const navigate = useNavigate()
  const { handleSubmit, pageError } = useLogin(navigate)

  return <LoginPage pageError={pageError} handleSubmit={handleSubmit} />
}
