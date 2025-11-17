import { createSimpleApiHandler } from '@/application/api/handler/factory'
import { createEndpointUseCase } from '@/domain/permission'

export default createSimpleApiHandler({
  createUseCase: createEndpointUseCase,
  execute: (useCase) => useCase.getAllEndpoints(),
  transform: (endpoints) => ({ endpoints }),
  logMessage: 'Endpoints retrieved successfully',
  logPayload: (endpoints) => ({ count: endpoints.length }),
  statusCode: 200,
})
