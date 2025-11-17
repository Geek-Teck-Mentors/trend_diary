import { z } from 'zod'
import { createApiHandler, type RequestContext } from '@/application/api/handler/factory'
import { createPermissionUseCase } from '@/domain/permission'

export const paramSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export default createApiHandler({
  createUseCase: createPermissionUseCase,
  execute: (useCase, context: RequestContext<z.infer<typeof paramSchema>>) =>
    useCase.deletePermission(context.param.id),
  transform: () => ({ message: 'Permission deleted successfully' }),
  logMessage: 'Permission deleted successfully',
  logPayload: (_result, context) => ({ permissionId: context.param.id }),
  statusCode: 200,
})
