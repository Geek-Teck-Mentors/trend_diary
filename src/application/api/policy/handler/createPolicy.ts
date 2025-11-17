import { createApiHandler } from '@/application/api/handler/factory'
import { createPrivacyPolicyUseCase, type PrivacyPolicyInput } from '@/domain/policy'

export default createApiHandler<
  ReturnType<typeof createPrivacyPolicyUseCase>,
  unknown,
  PrivacyPolicyInput
>({
  createUseCase: createPrivacyPolicyUseCase,
  execute: (useCase, { json }) => useCase.createPolicy(json.content),
  logMessage: (policy) => `Policy created: version ${policy.version}`,
  statusCode: 201,
})
