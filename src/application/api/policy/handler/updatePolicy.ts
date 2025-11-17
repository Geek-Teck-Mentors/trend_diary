import { createApiHandler, type RequestContext } from '@/application/api/handler/factory'
import type { PrivacyPolicy } from '@/domain/policy'
import {
  createPrivacyPolicyUseCase,
  type PrivacyPolicyUpdate,
  type VersionParam,
} from '@/domain/policy'

export default createApiHandler({
  createUseCase: createPrivacyPolicyUseCase,
  execute: (useCase, context: RequestContext<VersionParam, PrivacyPolicyUpdate>) =>
    useCase.updatePolicy(context.param.version, context.json.content),
  logMessage: (policy) => `Policy updated: version ${policy.version}`,
  statusCode: 200,
})
