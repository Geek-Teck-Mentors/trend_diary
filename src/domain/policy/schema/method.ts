import { failure, Result, success } from '@yuukihayashi0510/core'
import { ClientError } from '@/common/errors'
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
    return failure(new ClientError('有効化されたポリシーは更新できません'))
  }

  return success({
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
    return failure(new ClientError('このポリシーは既に有効化されています'))
  }

  return success({
    ...policy,
    effectiveAt,
    updatedAt: new Date(),
  })
}
