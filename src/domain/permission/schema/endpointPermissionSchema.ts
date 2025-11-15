import { z } from 'zod'

export const endpointPermissionSchema = z.object({
  endpointId: z.number().int().positive('endpointIdは正の整数である必要がある'),
  permissionId: z.number().int().positive('permissionIdは正の整数である必要がある'),
})

export const endpointPermissionInputSchema = endpointPermissionSchema

export type EndpointPermission = z.infer<typeof endpointPermissionSchema>
export type EndpointPermissionInput = z.infer<typeof endpointPermissionInputSchema>
