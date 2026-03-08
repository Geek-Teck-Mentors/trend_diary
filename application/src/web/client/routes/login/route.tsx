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
import LoginPage from './page'

type LoginActionData = {
  errors?: AuthenticateErrors
  formError?: string
}

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

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData()
  const validation = validateAuthenticateForm(formData)
  if (!validation.isValid) {
    return { errors: validation.errors } satisfies LoginActionData
  }

  let response: Response
  try {
    const endpoint = resolveInternalApiEndpoint('/api/v2/auth/login', context)
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: request.headers.get('Cookie') ?? '',
      },
      body: JSON.stringify(validation.data),
    })
  } catch {
    return { formError: '予期せぬエラーが発生しました。' } satisfies LoginActionData
  }

  if (response.ok) {
    const headers = new Headers()
    copySetCookieHeaders(response.headers, headers)
    return redirect('/trends', { headers })
  }

  if (response.status === 401 || response.status === 404) {
    return {
      formError: 'メールアドレスまたはパスワードが正しくありません',
    } satisfies LoginActionData
  }

  if (response.status === 500) {
    return {
      formError: 'サーバーエラーが発生しました。時間をおいて再度お試しください。',
    } satisfies LoginActionData
  }

  return { formError: '予期せぬエラーが発生しました。' } satisfies LoginActionData
}

export default function Login() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()

  return (
    <LoginPage
      isSubmitting={navigation.state === 'submitting'}
      errors={actionData?.errors}
      formError={actionData?.formError}
    />
  )
}

function copySetCookieHeaders(source: Headers, target: Headers) {
  const getSetCookie = (source as Headers & { getSetCookie?: () => string[] }).getSetCookie
  if (typeof getSetCookie === 'function') {
    for (const cookie of getSetCookie.call(source)) {
      target.append('Set-Cookie', cookie)
    }
    return
  }

  const setCookie = source.get('set-cookie')
  if (setCookie) {
    target.append('Set-Cookie', setCookie)
  }
}
