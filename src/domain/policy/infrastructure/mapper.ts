import type { PrivacyPolicy as RdbPrivacyPolicy } from '@prisma/client'
import PrivacyPolicy from '../model/privacyPolicy'

export function mapToPrivacyPolicy(policy: RdbPrivacyPolicy): PrivacyPolicy {
  return new PrivacyPolicy(
    policy.version,
    policy.content,
    policy.effectiveAt,
    policy.createdAt,
    policy.updatedAt,
  )
}
