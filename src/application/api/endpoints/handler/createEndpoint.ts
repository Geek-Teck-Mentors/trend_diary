import { z } from 'zod'
import { createApiHandler, type RequestContext } from '@/application/api/handler/factory'
import { createEndpointUseCase } from '@/domain/permission'
import { endpointInputSchema } from '@/domain/permission/schema/endpointSchema'

export const jsonSchema = endpointInputSchema

export default createApiHandler({
  createUseCase: createEndpointUseCase,
  execute: (useCase, context: RequestContext<unknown, z.infer<typeof jsonSchema>>) =>
    useCase.createEndpoint(context.json),
  transform: (endpoint) => ({ endpoint }),
  logMessage: 'Endpoint created successfully',
  logPayload: (endpoint) => ({ endpointPath: endpoint.path, endpointMethod: endpoint.method }),
  statusCode: 201,
})
