import { createApiHandler } from '@/application/api/handler/factory'
import type { PrivacyPolicy } from '@/domain/policy'
import {
  createPrivacyPolicyUseCase,
  type PrivacyPolicyActivate,
  type VersionParam,
} from '@/domain/policy'

export default createApiHandler<
  ReturnType<typeof createPrivacyPolicyUseCase>,
  VersionParam,
  PrivacyPolicyActivate,
  unknown,
  PrivacyPolicy
>({
  createUseCase: createPrivacyPolicyUseCase,
  execute: (useCase, { param, json }) => useCase.activatePolicy(param.version, json.effectiveAt),
  logMessage: (policy) => `Policy activated: version ${policy.version}`,
})
