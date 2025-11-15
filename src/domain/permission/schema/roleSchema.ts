import { z } from 'zod'

export const roleSchema = z.object({
  roleId: z.number().int().positive('roleIdは正の整数である必要がある'),
  name: z.string().min(1, 'nameは必須').max(100),
  displayName: z.string().min(1, 'displayNameは必須').max(255),
  description: z.string().max(1024).nullable(),
  isSystem: z.boolean().default(false),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const roleInputSchema = roleSchema.pick({
  name: true,
  displayName: true,
  description: true,
  isSystem: true,
  isActive: true,
})

export const roleUpdateSchema = roleSchema.pick({
  displayName: true,
  description: true,
  isActive: true,
})

export type Role = z.infer<typeof roleSchema>
export type RoleInput = z.infer<typeof roleInputSchema>
export type RoleUpdate = z.infer<typeof roleUpdateSchema>
