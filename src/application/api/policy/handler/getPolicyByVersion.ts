import { createApiHandler, type RequestContext } from '@/application/api/handler/factory'
import { createPrivacyPolicyUseCase, type VersionParam } from '@/domain/policy'

export default createApiHandler({
  createUseCase: createPrivacyPolicyUseCase,
  execute: (useCase, context: RequestContext<VersionParam>) =>
    useCase.getPolicyByVersion(context.param.version),
  logMessage: 'Policy retrieved',
  logPayload: (policy) => ({ version: policy.version }),
  statusCode: 200,
})
