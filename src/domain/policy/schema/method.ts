import { ClientError } from '@/common/errors'
import { Result, resultError, resultSuccess } from '@/common/types/utility'
import { PrivacyPolicy } from './privacyPolicySchema'

export function newPrivacyPolicy(nextVersion: number, content: string): PrivacyPolicy {
  return {
    version: nextVersion,
    content,
    effectiveAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export function isActive(policy: PrivacyPolicy): boolean {
  return policy.effectiveAt !== null
}

export function updateContent(
  policy: PrivacyPolicy,
  content: string,
): Result<PrivacyPolicy, ClientError> {
  if (isActive(policy)) {
    return resultError(new ClientError('有効化されたポリシーは更新できません'))
  }

  return resultSuccess({
    ...policy,
    content,
    updatedAt: new Date(),
  })
}

export function activate(
  policy: PrivacyPolicy,
  effectiveAt: Date,
): Result<PrivacyPolicy, ClientError> {
  if (isActive(policy)) {
    return resultError(new ClientError('このポリシーは既に有効化されています'))
  }

  return resultSuccess({
    ...policy,
    effectiveAt,
    updatedAt: new Date(),
  })
}
