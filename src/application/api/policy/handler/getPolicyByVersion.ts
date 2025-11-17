import { createSimpleApiHandler, type RequestContext } from '@/application/api/handler/factory'
import { createPrivacyPolicyUseCase, type VersionParam } from '@/domain/policy'

export default createSimpleApiHandler({
  createUseCase: createPrivacyPolicyUseCase,
  execute: (useCase, context: RequestContext<VersionParam>) =>
    useCase.getPolicyByVersion(context.param.version),
  logMessage: 'Policy retrieved',
  logPayload: (policy) => ({ version: policy.version }),
  statusCode: 200,
})
