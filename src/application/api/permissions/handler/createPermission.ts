import { z } from 'zod'
import { createApiHandler, type RequestContext } from '@/application/api/handler/factory'
import { createPermissionUseCase } from '@/domain/permission'
import { permissionInputSchema } from '@/domain/permission/schema/permissionSchema'

export const jsonSchema = permissionInputSchema

export default createApiHandler({
  createUseCase: createPermissionUseCase,
  execute: (useCase, context: RequestContext<unknown, z.infer<typeof jsonSchema>>) =>
    useCase.createPermission(context.json),
  transform: (permission) => ({ permission }),
  logMessage: 'Permission created successfully',
  logPayload: (permission) => ({ permissionName: permission.name }),
  statusCode: 201,
})
