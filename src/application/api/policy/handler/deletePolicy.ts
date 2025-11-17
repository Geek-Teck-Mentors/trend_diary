import { createSimpleApiHandler, type RequestContext } from '@/application/api/handler/factory'
import { createPrivacyPolicyUseCase, type VersionParam } from '@/domain/policy'

export default createSimpleApiHandler({
  createUseCase: createPrivacyPolicyUseCase,
  execute: (useCase, context: RequestContext<VersionParam>) =>
    useCase.deletePolicy(context.param.version),
  logMessage: 'Policy deleted',
  logPayload: (_, { param }) => ({ version: param.version }),
  statusCode: 204,
})
