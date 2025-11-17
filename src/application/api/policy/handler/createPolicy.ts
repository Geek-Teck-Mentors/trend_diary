import { createApiHandler, type RequestContext } from '@/application/api/handler/factory'
import type { PrivacyPolicy } from '@/domain/policy'
import { createPrivacyPolicyUseCase, type PrivacyPolicyInput } from '@/domain/policy'

export default createApiHandler({
  createUseCase: createPrivacyPolicyUseCase,
  execute: (useCase, context: RequestContext<unknown, PrivacyPolicyInput>) =>
    useCase.createPolicy(context.json.content),
  logMessage: (policy) => `Policy created: version ${policy.version}`,
  statusCode: 201,
})
