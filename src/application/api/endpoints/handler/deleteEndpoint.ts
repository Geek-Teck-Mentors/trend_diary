import { z } from 'zod'
import { createApiHandler, type RequestContext } from '@/application/api/handler/factory'
import { createEndpointUseCase } from '@/domain/permission'

export const paramSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export default createApiHandler({
  createUseCase: createEndpointUseCase,
  execute: (useCase, context: RequestContext<z.infer<typeof paramSchema>>) =>
    useCase.deleteEndpoint(context.param.id),
  transform: () => ({ message: 'Endpoint deleted successfully' }),
  logMessage: 'Endpoint deleted successfully',
  logPayload: (_result, context) => ({ endpointId: context.param.id }),
  statusCode: 200,
})
