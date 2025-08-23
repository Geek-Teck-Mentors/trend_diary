import { z } from 'zod'
import { createdAt, updatedAt } from '@/common/schema'

export const privacyPolicySchema = z.object({
  version: z.coerce.number().int().min(1, 'バージョンは1以上の数値である必要があります'),
  content: z.string().min(1, 'コンテンツは必須です'),
  effectiveAt: z.date().nullable(),
  createdAt,
  updatedAt,
})

export const privacyPolicyInputSchema = privacyPolicySchema.pick({
  content: true,
})

export const privacyPolicyUpdateSchema = privacyPolicySchema.pick({
  content: true,
})

export const privacyPolicyActivateSchema = z.object({
  effectiveAt: z
    .string()
    .datetime()
    .transform((val) => new Date(val)),
})

export const versionParamSchema = privacyPolicySchema.pick({
  version: true,
})

export type PrivacyPolicy = z.infer<typeof privacyPolicySchema>
export type PrivacyPolicyInput = z.infer<typeof privacyPolicyInputSchema>
export type PrivacyPolicyUpdate = z.infer<typeof privacyPolicyUpdateSchema>
export type PrivacyPolicyActivate = z.infer<typeof privacyPolicyActivateSchema>
export type VersionParam = z.infer<typeof versionParamSchema>
export type PrivacyPolicyOutput = z.output<typeof privacyPolicySchema>
