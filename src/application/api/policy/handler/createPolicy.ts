import { createSimpleApiHandler, type RequestContext } from '@/application/api/handler/factory'
import { createPrivacyPolicyUseCase, type PrivacyPolicyInput } from '@/domain/policy'

export default createSimpleApiHandler({
  createUseCase: createPrivacyPolicyUseCase,
  execute: (useCase, context: RequestContext<unknown, PrivacyPolicyInput>) =>
    useCase.createPolicy(context.json.content),
  logMessage: 'Policy created',
  logPayload: (policy) => ({ version: policy.version }),
  statusCode: 201,
})
