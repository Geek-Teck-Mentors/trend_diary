import { z } from 'zod'

export const rolePermissionSchema = z.object({
  roleId: z.number().int().positive('roleIdは正の整数である必要がある'),
  permissionId: z.number().int().positive('permissionIdは正の整数である必要がある'),
})

export const rolePermissionInputSchema = rolePermissionSchema

export type RolePermission = z.infer<typeof rolePermissionSchema>
export type RolePermissionInput = z.infer<typeof rolePermissionInputSchema>
