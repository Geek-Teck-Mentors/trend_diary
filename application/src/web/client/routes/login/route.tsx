import { isFailure } from '@yuukihayashi0510/core'
import {
  type ActionFunctionArgs,
  type MetaFunction,
  redirect,
  useActionData,
  useNavigation,
} from 'react-router'
import { ClientError, ServerError } from '@/common/errors'
import { createAuthActionUseCase } from '@/web/client/features/authenticate/auth-action-use-case'
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

  try {
    const { useCase, headers } = createAuthActionUseCase(request, context)
    const result = await useCase.login(validation.data.email, validation.data.password)

    if (isFailure(result)) {
      if (
        result.error instanceof ClientError &&
        (result.error.statusCode === 401 || result.error.statusCode === 404)
      ) {
        return {
          formError: 'メールアドレスまたはパスワードが正しくありません',
        } satisfies LoginActionData
      }

      if (result.error instanceof ServerError && result.error.statusCode === 500) {
        return {
          formError: 'サーバーエラーが発生しました。時間をおいて再度お試しください。',
        } satisfies LoginActionData
      }

      return { formError: '予期せぬエラーが発生しました。' } satisfies LoginActionData
    }

    return redirect('/trends', { headers })
  } catch {
    return { formError: '予期せぬエラーが発生しました。' } satisfies LoginActionData
  }
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
