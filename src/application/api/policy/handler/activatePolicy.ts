import { createApiHandler, type RequestContext } from '@/application/api/handler/factory'
import type { PrivacyPolicy } from '@/domain/policy'
import {
  createPrivacyPolicyUseCase,
  type PrivacyPolicyActivate,
  type VersionParam,
} from '@/domain/policy'

export default createApiHandler({
  createUseCase: createPrivacyPolicyUseCase,
  execute: (useCase, context: RequestContext<VersionParam, PrivacyPolicyActivate>) =>
    useCase.activatePolicy(context.param.version, context.json.effectiveAt),
  logMessage: (policy) => `Policy activated: version ${policy.version}`,
  statusCode: 200,
})
