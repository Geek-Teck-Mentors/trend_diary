import { z } from 'zod'

export const roleSchema = z.object({
  roleId: z.number().int().positive('roleIdは正の整数である必要がある'),
  preset: z.boolean(),
  displayName: z.string().min(1, 'displayNameは必須').max(255),
  description: z.string().max(1024).nullable(),
  createdAt: z.date(),
})

export const roleInputSchema = roleSchema.pick({
  displayName: true,
  description: true,
})

export const roleUpdateSchema = roleInputSchema

export type Role = z.infer<typeof roleSchema>
export type RoleInput = z.infer<typeof roleInputSchema>
export type RoleUpdate = RoleInput
