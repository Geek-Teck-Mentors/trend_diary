import type { MetaFunction } from '@remix-run/cloudflare'
import LoginPage from './page'
import useLogin from './useLogin'

export const meta: MetaFunction = () => [
  { title: 'ログイン | TrendDiary' },
  {
    name: 'description',
    content: 'TrendDiaryにログインして、技術トレンドの管理を始めましょう。Qiita、Zennの記事を効率的に管理できます。',
  },
  { property: 'og:title', content: 'ログイン | TrendDiary' },
  {
    property: 'og:description',
    content: 'TrendDiaryにログインして、技術トレンドの管理を始めましょう。Qiita、Zennの記事を効率的に管理できます。',
  },
  { property: 'og:url', content: '/login' },
  { name: 'twitter:title', content: 'ログイン | TrendDiary' },
  {
    name: 'twitter:description',
    content: 'TrendDiaryにログインして、技術トレンドの管理を始めましょう。Qiita、Zennの記事を効率的に管理できます。',
  },
]

export default function Login() {
  const { handleSubmit, pageError } = useLogin()

  return <LoginPage pageError={pageError} handleSubmit={handleSubmit} />
}
