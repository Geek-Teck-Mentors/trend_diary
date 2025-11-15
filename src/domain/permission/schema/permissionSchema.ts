import { z } from 'zod'

export const permissionSchema = z.object({
  permissionId: z.number().int().positive('permissionIdは正の整数である必要がある'),
  resource: z.string().min(1, 'resourceは必須').max(100),
  action: z.string().min(1, 'actionは必須').max(100),
  description: z.string().max(1024).nullable(),
  isSystem: z.boolean().default(false),
  createdAt: z.date(),
})

export const permissionInputSchema = permissionSchema.pick({
  resource: true,
  action: true,
  description: true,
  isSystem: true,
})

export type Permission = z.infer<typeof permissionSchema>
export type PermissionInput = z.infer<typeof permissionInputSchema>
