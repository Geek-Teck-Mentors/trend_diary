import { isFailure } from '@yuukihayashi0510/core'
import {
  type ActionFunctionArgs,
  type MetaFunction,
  redirect,
  useActionData,
  useNavigation,
} from 'react-router'
import { AlreadyExistsError, ClientError, ServerError } from '@/common/errors'
import { createAuthActionUseCase } from '@/web/client/features/authenticate/auth-action-use-case'
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

  try {
    const { useCase } = createAuthActionUseCase(request, context)
    const result = await useCase.signup(validation.data.email, validation.data.password)

    if (isFailure(result)) {
      if (
        result.error instanceof AlreadyExistsError ||
        (result.error instanceof ClientError && result.error.statusCode === 409)
      ) {
        return { formError: 'このメールアドレスは既に使用されています' } satisfies SignupActionData
      }

      if (result.error instanceof ServerError && result.error.statusCode === 500) {
        return {
          formError: 'サーバーエラーが発生しました。時間をおいて再度お試しください。',
        } satisfies SignupActionData
      }

      return { formError: '予期せぬエラーが発生しました。' } satisfies SignupActionData
    }

    return redirect('/login')
  } catch {
    return { formError: '予期せぬエラーが発生しました。' } satisfies SignupActionData
  }
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
