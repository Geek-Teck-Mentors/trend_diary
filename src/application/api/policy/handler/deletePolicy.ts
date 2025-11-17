import { createApiHandler } from '@/application/api/handler/factory'
import { createPrivacyPolicyUseCase, type VersionParam } from '@/domain/policy'

export default createApiHandler<
  ReturnType<typeof createPrivacyPolicyUseCase>,
  VersionParam,
  unknown,
  unknown,
  void
>({
  createUseCase: createPrivacyPolicyUseCase,
  execute: (useCase, { param }) => useCase.deletePolicy(param.version),
  logMessage: 'Policy deleted',
  statusCode: 204,
})
