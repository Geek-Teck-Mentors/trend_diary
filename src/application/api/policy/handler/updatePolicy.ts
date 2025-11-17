import { createSimpleApiHandler, type RequestContext } from '@/application/api/handler/factory'
import {
  createPrivacyPolicyUseCase,
  type PrivacyPolicyUpdate,
  type VersionParam,
} from '@/domain/policy'

export default createSimpleApiHandler({
  createUseCase: createPrivacyPolicyUseCase,
  execute: (useCase, context: RequestContext<VersionParam, PrivacyPolicyUpdate>) =>
    useCase.updatePolicy(context.param.version, context.json.content),
  logMessage: 'Policy updated',
  logPayload: (policy) => ({ version: policy.version }),
  statusCode: 200,
})
