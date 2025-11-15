import { z } from 'zod'

export const permissionSchema = z.object({
  permissionId: z.number().int().positive('permissionIdは正の整数である必要がある'),
  resource: z.string().min(1, 'resourceは必須').max(100),
  action: z.string().min(1, 'actionは必須').max(100),
})

export const permissionInputSchema = permissionSchema.pick({
  resource: true,
  action: true,
})

export type Permission = z.infer<typeof permissionSchema>
export type PermissionInput = z.infer<typeof permissionInputSchema>
