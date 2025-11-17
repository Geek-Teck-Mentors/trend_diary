import { createSimpleApiHandler } from '@/application/api/handler/factory'
import { createPermissionUseCase } from '@/domain/permission'

export default createSimpleApiHandler({
  createUseCase: createPermissionUseCase,
  execute: (useCase) => useCase.getAllPermissions(),
  transform: (permissions) => ({ permissions }),
  logMessage: 'Permissions retrieved successfully',
  logPayload: (permissions) => ({ count: permissions.length }),
  statusCode: 200,
})
