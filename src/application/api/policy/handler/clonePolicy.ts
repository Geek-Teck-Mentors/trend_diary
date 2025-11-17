import { createSimpleApiHandler, type RequestContext } from '@/application/api/handler/factory'
import { createPrivacyPolicyUseCase, type VersionParam } from '@/domain/policy'

export default createSimpleApiHandler({
  createUseCase: createPrivacyPolicyUseCase,
  execute: (useCase, context: RequestContext<VersionParam>) =>
    useCase.clonePolicy(context.param.version),
  logMessage: 'Policy cloned',
  logPayload: (policy) => ({ newVersion: policy.version }),
  statusCode: 201,
})
