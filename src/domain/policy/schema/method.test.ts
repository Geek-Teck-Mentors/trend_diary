import { ClientError } from '@/common/errors'
import { resultError, resultSuccess } from '@/common/types/utility'
import { activate, isActive, newPrivacyPolicy, updateContent } from './method'

describe('PrivacyPolicy Method', () => {
  describe('newPrivacyPolicy', () => {
    it('新しい下書きポリシーを生成する', () => {
      const policy = newPrivacyPolicy(3, 'サンプルコンテンツ')

      expect(policy).toBeDefined()
      expect(policy.version).toBe(3)
      expect(policy.content).toBe('サンプルコンテンツ')
      expect(policy.effectiveAt).toBeNull()
      expect(policy.createdAt).toBeInstanceOf(Date)
      expect(policy.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('isActive', () => {
    it('effectiveAtが設定されているとtrueを返す', () => {
      const policy = newPrivacyPolicy(1, 'x')
      policy.effectiveAt = new Date()
      expect(isActive(policy)).toBe(true)
    })

    it('effectiveAtがnullだとfalseを返す', () => {
      const policy = newPrivacyPolicy(1, 'x')
      expect(isActive(policy)).toBe(false)
    })
  })

  describe('updateContent', () => {
    it('下書きのポリシーは更新でき、resultSuccessを返す', () => {
      const policy = newPrivacyPolicy(1, 'old')
      const result = updateContent(policy, 'new')

      expect(result).toEqual(
        resultSuccess({
          ...policy,
          content: 'new',
          updatedAt: expect.any(Date),
        }),
      )
    })

    it('有効化済みのポリシーは更新できずresultErrorを返す', () => {
      const policy = newPrivacyPolicy(2, 'old')
      policy.effectiveAt = new Date()
      const result = updateContent(policy, 'new')

      expect(result).toEqual(resultError(new ClientError('有効化されたポリシーは更新できません')))
    })
  })

  describe('activate', () => {
    it('下書きのポリシーを指定日時で有効化できる', () => {
      const policy = newPrivacyPolicy(1, 'content')
      const effectiveAt = new Date('2025-01-01T00:00:00Z')
      const result = activate(policy, effectiveAt)

      expect(result).toEqual(
        resultSuccess({
          ...policy,
          effectiveAt,
          updatedAt: expect.any(Date),
        }),
      )
    })

    it('既に有効化済みのポリシーは再度有効化できずresultErrorを返す', () => {
      const policy = newPrivacyPolicy(1, 'content')
      policy.effectiveAt = new Date()
      const result = activate(policy, new Date())

      expect(result).toEqual(resultError(new ClientError('このポリシーは既に有効化されています')))
    })
  })
})
