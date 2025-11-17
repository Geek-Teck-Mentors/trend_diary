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
  execute: (useCase, { param }) => useCase.getPolicyByVersion(param.version),
  logMessage: (policy) => `Policy retrieved: version ${policy.version}`,
  statusCode: 200,
})
