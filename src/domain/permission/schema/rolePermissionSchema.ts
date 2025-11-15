import { z } from 'zod'

export const rolePermissionSchema = z.object({
  rolePermissionId: z.number().int().positive('rolePermissionIdは正の整数である必要がある'),
  roleId: z.number().int().positive('roleIdは正の整数である必要がある'),
  permissionId: z.number().int().positive('permissionIdは正の整数である必要がある'),
  createdAt: z.date(),
})

export const rolePermissionInputSchema = rolePermissionSchema.pick({
  roleId: true,
  permissionId: true,
})

export type RolePermission = z.infer<typeof rolePermissionSchema>
export type RolePermissionInput = z.infer<typeof rolePermissionInputSchema>
