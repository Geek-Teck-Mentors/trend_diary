import { createApiHandler } from '@/application/api/handler/factory'
import type { PrivacyPolicy } from '@/domain/policy'
import { createPrivacyPolicyUseCase, type VersionParam } from '@/domain/policy'

export default createApiHandler<
  ReturnType<typeof createPrivacyPolicyUseCase>,
  VersionParam,
  unknown,
  unknown,
  PrivacyPolicy
>({
  createUseCase: createPrivacyPolicyUseCase,
  execute: (useCase, { param }) => useCase.clonePolicy(param.version),
  logMessage: (policy) => `Policy cloned: new version ${policy.version}`,
  statusCode: 201,
})
