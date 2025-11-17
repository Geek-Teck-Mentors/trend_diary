import { z } from 'zod'
import { createApiHandler, type RequestContext } from '@/application/api/handler/factory'
import { createRoleUseCase } from '@/domain/permission'

export const paramSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export default createApiHandler({
  createUseCase: createRoleUseCase,
  execute: (useCase, context: RequestContext<z.infer<typeof paramSchema>>) =>
    useCase.deleteRole(context.param.id),
  transform: () => ({ message: 'Role deleted successfully' }),
  logMessage: 'Role deleted successfully',
  logPayload: (_result, context) => ({ roleId: context.param.id }),
  statusCode: 200,
})
