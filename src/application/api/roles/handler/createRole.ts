import { z } from 'zod'
import { createSimpleApiHandler, type RequestContext } from '@/application/api/handler/factory'
import { createRoleUseCase } from '@/domain/permission'
import { roleInputSchema } from '@/domain/permission/schema/roleSchema'

export const jsonSchema = roleInputSchema

export default createSimpleApiHandler({
  createUseCase: createRoleUseCase,
  execute: (useCase, context: RequestContext<unknown, z.infer<typeof jsonSchema>>) =>
    useCase.createRole(context.json),
  transform: (role) => ({ role }),
  logMessage: 'Role created successfully',
  logPayload: (role) => ({ roleName: role.displayName }),
  statusCode: 201,
})
