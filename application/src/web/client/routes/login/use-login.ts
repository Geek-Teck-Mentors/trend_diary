import { NavigateFunction } from 'react-router'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'
import { resolveLoginErrorMessage } from '../../features/authenticate/error-message'
import { AuthenticateFormData } from '../../features/authenticate/validation'
import { createSWRFetcher } from '../../features/create-swr-fetcher'

export default function useLogin(navigate: NavigateFunction) {
  const { client, apiCall } = createSWRFetcher()

  const { trigger, isMutating } = useSWRMutation(
    'v2/auth/login',
    async (_key: string, { arg }: { arg: AuthenticateFormData }) => {
      return apiCall(() =>
        client.v2.auth.login.$post({
          json: {
            email: arg.email,
            password: arg.password,
          },
        }),
      )
    },
    {
      onSuccess: () => {
        toast.success('ログインしました')
        navigate('/trends')
      },
      onError: (error: Error) => {
        toast.error(resolveLoginErrorMessage(error))
      },
    },
  )

  async function handleSubmit(data: AuthenticateFormData): Promise<void> {
    await trigger(data)
  }

  return { handleSubmit, isLoading: isMutating }
}
