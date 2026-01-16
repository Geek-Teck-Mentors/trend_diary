import type { MetaFunction } from 'react-router'
import PrivacyPolicyPage from './page'

export const meta: MetaFunction = () => [
  { title: 'プライバシーポリシー | TrendDiary' },
  {
    name: 'description',
    content:
      'TrendDiaryのプライバシーポリシー。個人情報の取り扱い、収集する情報、利用目的についてご確認いただけます。',
  },
  { property: 'og:title', content: 'プライバシーポリシー | TrendDiary' },
  {
    property: 'og:description',
    content:
      'TrendDiaryのプライバシーポリシー。個人情報の取り扱い、収集する情報、利用目的についてご確認いただけます。',
  },
  { property: 'og:url', content: '/privacy-policy' },
  { name: 'twitter:title', content: 'プライバシーポリシー | TrendDiary' },
  {
    name: 'twitter:description',
    content:
      'TrendDiaryのプライバシーポリシー。個人情報の取り扱い、収集する情報、利用目的についてご確認いただけます。',
  },
]

export default function PrivacyPolicy() {
  return <PrivacyPolicyPage />
}
