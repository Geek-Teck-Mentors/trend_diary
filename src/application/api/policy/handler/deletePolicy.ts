import { createApiHandler, type RequestContext } from '@/application/api/handler/factory'
import { createPrivacyPolicyUseCase, type VersionParam } from '@/domain/policy'

export default createApiHandler({
  createUseCase: createPrivacyPolicyUseCase,
  execute: (useCase, context: RequestContext<VersionParam>) =>
    useCase.deletePolicy(context.param.version),
  logMessage: (_, { param }) => `Policy deleted: version ${param.version}`,
  statusCode: 204,
})
