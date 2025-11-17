import { z } from 'zod'
import { createApiHandler, type RequestContext } from '@/application/api/handler/factory'
import { createRoleUseCase } from '@/domain/permission'
import { roleUpdateSchema } from '@/domain/permission/schema/roleSchema'

export const paramSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const jsonSchema = roleUpdateSchema

export default createApiHandler({
  createUseCase: createRoleUseCase,
  execute: (
    useCase,
    context: RequestContext<z.infer<typeof paramSchema>, z.infer<typeof jsonSchema>>,
  ) => useCase.updateRole(context.param.id, context.json),
  transform: (role) => ({ role }),
  logMessage: 'Role updated successfully',
  logPayload: (role) => ({ roleId: role.id, roleName: role.name }),
  statusCode: 200,
})
