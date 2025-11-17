import { createApiHandler, type RequestContext } from '@/application/api/handler/factory'
import type { PrivacyPolicy } from '@/domain/policy'
import { createPrivacyPolicyUseCase, type VersionParam } from '@/domain/policy'

export default createApiHandler({
  createUseCase: createPrivacyPolicyUseCase,
  execute: (useCase, context: RequestContext<VersionParam>) =>
    useCase.getPolicyByVersion(context.param.version),
  logMessage: (policy) => `Policy retrieved: version ${policy.version}`,
  statusCode: 200,
})
