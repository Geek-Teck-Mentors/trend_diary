import { z } from 'zod'
import { createSimpleApiHandler, type RequestContext } from '@/application/api/handler/factory'
import { createPermissionUseCase } from '@/domain/permission'
import { permissionInputSchema } from '@/domain/permission/schema/permissionSchema'

export const jsonSchema = permissionInputSchema

export default createSimpleApiHandler({
  createUseCase: createPermissionUseCase,
  execute: (useCase, context: RequestContext<unknown, z.infer<typeof jsonSchema>>) =>
    useCase.createPermission(context.json),
  transform: (permission) => ({ permission }),
  logMessage: 'Permission created successfully',
  logPayload: (permission) => ({
    resource: permission.resource,
    action: permission.action,
  }),
  statusCode: 201,
})
