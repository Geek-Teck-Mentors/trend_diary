import { createApiHandler, type RequestContext } from '@/application/api/handler/factory'
import { ActiveUserInput, createUserUseCase } from '@/domain/user'

export default createApiHandler({
  createUseCase: createUserUseCase,
  execute: (useCase, context: RequestContext<unknown, ActiveUserInput>) =>
    useCase.signup(context.json.email, context.json.password),
  logMessage: 'sign up success',
  logPayload: (activeUser) => ({ activeUserId: activeUser.activeUserId.toString() }),
  statusCode: 201,
})
