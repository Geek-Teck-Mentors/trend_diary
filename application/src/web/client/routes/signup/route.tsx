import {
  type ActionFunctionArgs,
  type MetaFunction,
  redirect,
  useActionData,
  useNavigation,
} from 'react-router'
import { resolveInternalApiEndpoint } from '@/web/client/features/authenticate/internal-api-endpoint'
import {
  type AuthenticateErrors,
  validateAuthenticateForm,
} from '../../features/authenticate/validation'
import SignupPage from './page'

type SignupActionData = {
  errors?: AuthenticateErrors
  formError?: string
}

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

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData()
  const validation = validateAuthenticateForm(formData)
  if (!validation.isValid) {
    return { errors: validation.errors } satisfies SignupActionData
  }

  let response: Response
  try {
    const endpoint = resolveInternalApiEndpoint('/api/v2/auth/signup', context)
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: request.headers.get('Cookie') ?? '',
      },
      body: JSON.stringify(validation.data),
    })
  } catch {
    return { formError: '予期せぬエラーが発生しました。' } satisfies SignupActionData
  }

  if (response.ok) {
    return redirect('/login')
  }

  if (response.status === 409) {
    return { formError: 'このメールアドレスは既に使用されています' } satisfies SignupActionData
  }

  if (response.status === 500) {
    return {
      formError: 'サーバーエラーが発生しました。時間をおいて再度お試しください。',
    } satisfies SignupActionData
  }

  return { formError: '予期せぬエラーが発生しました。' } satisfies SignupActionData
}

export default function Signup() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()

  return (
    <SignupPage
      isSubmitting={navigation.state === 'submitting'}
      errors={actionData?.errors}
      formError={actionData?.formError}
    />
  )
}
