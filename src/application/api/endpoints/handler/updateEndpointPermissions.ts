import { z } from 'zod'
import { createApiHandler, type RequestContext } from '@/application/api/handler/factory'
import { createEndpointUseCase } from '@/domain/permission'

export const paramSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const jsonSchema = z.object({
  permissionIds: z.array(z.number().int().positive()),
})

export default createApiHandler({
  createUseCase: createEndpointUseCase,
  execute: (
    useCase,
    context: RequestContext<z.infer<typeof paramSchema>, z.infer<typeof jsonSchema>>,
  ) => useCase.updateEndpointPermissions(context.param.id, context.json.permissionIds),
  transform: () => ({ message: 'Endpoint permissions updated successfully' }),
  logMessage: 'Endpoint permissions updated successfully',
  logPayload: (_result, context) => ({
    endpointId: context.param.id,
    permissionCount: context.json.permissionIds.length,
  }),
  statusCode: 200,
})
