import { NavigateFunction } from 'react-router'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'
import { resolveSignupErrorMessage } from '../../features/authenticate/error-message'
import { AuthenticateFormData } from '../../features/authenticate/validation'
import { createSWRFetcher } from '../../features/create-swr-fetcher'

export default function useSignup(navigate: NavigateFunction) {
  const { client, apiCall } = createSWRFetcher()

  const { trigger, isMutating } = useSWRMutation(
    'v2/auth/signup',
    async (_key: string, { arg }: { arg: AuthenticateFormData }) => {
      return apiCall(() =>
        client.v2.auth.signup.$post({
          json: arg,
        }),
      )
    },
    {
      onSuccess: () => {
        toast.success('アカウントを作成しました。ログインしてください。')
        navigate('/login')
      },
      onError: (error: Error) => {
        toast.error(resolveSignupErrorMessage(error))
      },
    },
  )

  async function handleSubmit(data: AuthenticateFormData): Promise<void> {
    await trigger(data)
  }

  return { handleSubmit, isLoading: isMutating }
}
