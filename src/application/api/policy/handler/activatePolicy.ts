import { createApiHandler, type RequestContext } from '@/application/api/handler/factory'
import {
  createPrivacyPolicyUseCase,
  type PrivacyPolicyActivate,
  type VersionParam,
} from '@/domain/policy'

export default createApiHandler({
  createUseCase: createPrivacyPolicyUseCase,
  execute: (useCase, context: RequestContext<VersionParam, PrivacyPolicyActivate>) =>
    useCase.activatePolicy(context.param.version, context.json.effectiveAt),
  logMessage: 'Policy activated',
  logPayload: (policy) => ({ version: policy.version, effectiveAt: policy.effectiveAt }),
  statusCode: 200,
})
