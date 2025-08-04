import { z } from 'zod'

export const privacyPolicySchema = z.object({
  version: z.number().int().min(0),
  content: z.string(),
  effectiveAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const privacyPolicyInputSchema = z.object({
  content: z.string().min(1, 'コンテンツは必須です'),
})

export const privacyPolicyUpdateSchema = z.object({
  content: z.string().min(1, 'コンテンツは必須です'),
})

export const privacyPolicyActivateSchema = z.object({
  effectiveAt: z.date(),
})

export const privacyPolicyCloneSchema = z.object({})

export const versionParamSchema = z.object({
  version: z.coerce.number().int().min(1, 'バージョンは1以上の数値である必要があります'),
})

export type PrivacyPolicyInput = z.infer<typeof privacyPolicyInputSchema>
export type PrivacyPolicyUpdate = z.infer<typeof privacyPolicyUpdateSchema>
export type PrivacyPolicyActivate = z.infer<typeof privacyPolicyActivateSchema>
export type PrivacyPolicyClone = z.infer<typeof privacyPolicyCloneSchema>
export type VersionParam = z.infer<typeof versionParamSchema>
