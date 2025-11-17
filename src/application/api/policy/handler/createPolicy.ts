import { createApiHandler } from '@/application/api/handler/factory'
import type { PrivacyPolicy } from '@/domain/policy'
import { createPrivacyPolicyUseCase, type PrivacyPolicyInput } from '@/domain/policy'

export default createApiHandler<
  ReturnType<typeof createPrivacyPolicyUseCase>,
  unknown,
  PrivacyPolicyInput,
  unknown,
  PrivacyPolicy
>({
  createUseCase: createPrivacyPolicyUseCase,
  execute: (useCase, { json }) => useCase.createPolicy(json.content),
  logMessage: (policy) => `Policy created: version ${policy.version}`,
  statusCode: 201,
})
