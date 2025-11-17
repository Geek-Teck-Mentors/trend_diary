import { z } from 'zod'
import { createApiHandler, type RequestContext } from '@/application/api/handler/factory'
import { createRoleUseCase } from '@/domain/permission'

export const paramSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const jsonSchema = z.object({
  permissionIds: z.array(z.number().int().positive()),
})

export default createApiHandler({
  createUseCase: createRoleUseCase,
  execute: (
    useCase,
    context: RequestContext<z.infer<typeof paramSchema>, z.infer<typeof jsonSchema>>,
  ) => useCase.updateRolePermissions(context.param.id, context.json.permissionIds),
  transform: () => ({ message: 'Role permissions updated successfully' }),
  logMessage: 'Role permissions updated successfully',
  logPayload: (_result, context) => ({
    roleId: context.param.id,
    permissionCount: context.json.permissionIds.length,
  }),
  statusCode: 200,
})
