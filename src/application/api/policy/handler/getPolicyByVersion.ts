import { createApiHandler } from '@/application/api/handler/factory'
import { createPrivacyPolicyUseCase, type VersionParam } from '@/domain/policy'

export default createApiHandler<ReturnType<typeof createPrivacyPolicyUseCase>, VersionParam>({
  createUseCase: createPrivacyPolicyUseCase,
  execute: (useCase, { param }) => useCase.getPolicyByVersion(param.version),
  logMessage: (policy) => `Policy retrieved: version ${policy.version}`,
})
