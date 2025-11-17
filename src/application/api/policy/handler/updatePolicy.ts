import { createApiHandler } from '@/application/api/handler/factory'
import {
  createPrivacyPolicyUseCase,
  type PrivacyPolicyUpdate,
  type VersionParam,
} from '@/domain/policy'

export default createApiHandler<
  ReturnType<typeof createPrivacyPolicyUseCase>,
  VersionParam,
  PrivacyPolicyUpdate
>({
  createUseCase: createPrivacyPolicyUseCase,
  execute: (useCase, { param, json }) => useCase.updatePolicy(param.version, json.content),
  logMessage: (policy) => `Policy updated: version ${policy.version}`,
})
