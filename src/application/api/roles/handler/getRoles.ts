import { createApiHandler } from '@/application/api/handler/factory'
import { createRoleUseCase } from '@/domain/permission'

export default createApiHandler({
  createUseCase: createRoleUseCase,
  execute: (useCase) => useCase.getAllRoles(),
  transform: (roles) => ({ roles }),
  logMessage: 'Roles retrieved successfully',
  logPayload: (roles) => ({ count: roles.length }),
  statusCode: 200,
})
