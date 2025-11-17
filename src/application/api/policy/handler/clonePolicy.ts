import { createApiHandler } from '@/application/api/handler/factory'
import { createPrivacyPolicyUseCase, type VersionParam } from '@/domain/policy'

export default createApiHandler<ReturnType<typeof createPrivacyPolicyUseCase>, VersionParam>({
  createUseCase: createPrivacyPolicyUseCase,
  execute: (useCase, { param }) => useCase.clonePolicy(param.version),
  logMessage: (policy) => `Policy cloned: new version ${policy.version}`,
  statusCode: 201,
})
