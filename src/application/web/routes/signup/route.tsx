import { LoaderFunctionArgs, type MetaFunction, redirect, useNavigate } from 'react-router'
import { isUserFeatureEnabled } from '../../features/featureFlag'
import SignupPage from './page'
import useSignup from './useSignup'

export const meta: MetaFunction = () => [
  { title: 'アカウント作成 | TrendDiary' },
  {
    name: 'description',
    content:
      'TrendDiaryのアカウントを作成して、技術トレンドの管理を始めましょう。無料で始められる技術者向けサービスです。',
  },
  { property: 'og:title', content: 'アカウント作成 | TrendDiary' },
  {
    property: 'og:description',
    content:
      'TrendDiaryのアカウントを作成して、技術トレンドの管理を始めましょう。無料で始められる技術者向けサービスです。',
  },
  { property: 'og:url', content: '/signup' },
  { name: 'twitter:title', content: 'アカウント作成 | TrendDiary' },
  {
    name: 'twitter:description',
    content:
      'TrendDiaryのアカウントを作成して、技術トレンドの管理を始めましょう。無料で始められる技術者向けサービスです。',
  },
]

export async function loader({ context }: LoaderFunctionArgs) {
  const env = context.cloudflare?.env
  if (!isUserFeatureEnabled(env)) {
    throw redirect('/?error=user_feature_disabled')
  }
  return null
}

export default function Signup() {
  const navigate = useNavigate()
  const { handleSubmit, pageError } = useSignup(navigate)

  return <SignupPage handleSubmit={handleSubmit} pageError={pageError} />
}
