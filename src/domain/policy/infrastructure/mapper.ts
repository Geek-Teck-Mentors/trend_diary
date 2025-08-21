import type { PrivacyPolicy as RdbPrivacyPolicy } from '@prisma/client'
import type { PrivacyPolicy } from '../schema/privacyPolicySchema'

export function mapToPrivacyPolicy(policy: RdbPrivacyPolicy): PrivacyPolicy {
  return {
    version: policy.version,
    content: policy.content,
    effectiveAt: policy.effectiveAt,
    createdAt: policy.createdAt,
    updatedAt: policy.updatedAt,
  }
}
