import { describe, expect, it } from 'vitest'
import PrivacyPolicy from './privacyPolicy'

describe('PrivacyPolicy', () => {
  describe('基本動作', () => {
    it('プライバシーポリシーオブジェクトを作成できる', () => {
      const policy = new PrivacyPolicy(
        1,
        'このプライバシーポリシーは...',
        null, // 下書き状態
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      )

      expect(policy.version).toBe(1)
      expect(policy.content).toBe('このプライバシーポリシーは...')
      expect(policy.effectiveAt).toBeNull()
      expect(policy.createdAt).toEqual(new Date('2024-01-01T00:00:00Z'))
      expect(policy.updatedAt).toEqual(new Date('2024-01-01T00:00:00Z'))
    })

    it('有効化されたプライバシーポリシーオブジェクトを作成できる', () => {
      const effectiveDate = new Date('2024-01-15T00:00:00Z')
      const policy = new PrivacyPolicy(
        2,
        '更新されたプライバシーポリシーは...',
        effectiveDate,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      )

      expect(policy.version).toBe(2)
      expect(policy.content).toBe('更新されたプライバシーポリシーは...')
      expect(policy.effectiveAt).toEqual(effectiveDate)
    })
  })

  describe('境界値・特殊値', () => {
    it('contentが空文字列でもオブジェクトを作成できる', () => {
      const policy = new PrivacyPolicy(1, '', null, new Date(), new Date())

      expect(policy.content).toBe('')
    })

    it('versionが0でもオブジェクトを作成できる', () => {
      const policy = new PrivacyPolicy(0, 'テストコンテンツ', null, new Date(), new Date())

      expect(policy.version).toBe(0)
    })
  })

  describe('状態判定メソッド', () => {
    it('isDraft() - effectiveAtがnullの場合はtrueを返す', () => {
      const policy = new PrivacyPolicy(1, 'テストコンテンツ', null, new Date(), new Date())

      expect(policy.isDraft()).toBe(true)
    })

    it('isDraft() - effectiveAtがnullでない場合はfalseを返す', () => {
      const policy = new PrivacyPolicy(1, 'テストコンテンツ', new Date(), new Date(), new Date())

      expect(policy.isDraft()).toBe(false)
    })

    it('isActive() - effectiveAtがnullの場合はfalseを返す', () => {
      const policy = new PrivacyPolicy(1, 'テストコンテンツ', null, new Date(), new Date())

      expect(policy.isActive()).toBe(false)
    })

    it('isActive() - effectiveAtがnullでない場合はtrueを返す', () => {
      const policy = new PrivacyPolicy(1, 'テストコンテンツ', new Date(), new Date(), new Date())

      expect(policy.isActive()).toBe(true)
    })
  })

  describe('ビジネスロジック', () => {
    it('activate() - 下書き状態のポリシーを有効化できる', () => {
      const policy = new PrivacyPolicy(
        1,
        'テストコンテンツ',
        null,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      )

      const effectiveDate = new Date('2024-01-15T00:00:00Z')
      policy.activate(effectiveDate)

      expect(policy.effectiveAt).toEqual(effectiveDate)
      expect(policy.isDraft()).toBe(false)
      expect(policy.isActive()).toBe(true)
    })

    it('updateContent() - 下書き状態のポリシーのコンテンツを更新できる', () => {
      const policy = new PrivacyPolicy(
        1,
        '古いコンテンツ',
        null,
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      )

      const newContent = '新しいコンテンツ'
      policy.updateContent(newContent)

      expect(policy.content).toBe(newContent)
      expect(policy.updatedAt.getTime()).toBeGreaterThan(new Date('2024-01-01T00:00:00Z').getTime())
    })

    it('clone() - 既存ポリシーから新しい下書きポリシーを作成できる', () => {
      const originalPolicy = new PrivacyPolicy(
        1,
        '元のコンテンツ',
        new Date('2024-01-15T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      )

      const newVersion = 2
      const clonedPolicy = originalPolicy.clone(newVersion)

      expect(clonedPolicy.version).toBe(newVersion)
      expect(clonedPolicy.content).toBe(originalPolicy.content)
      expect(clonedPolicy.effectiveAt).toBeNull() // 下書き状態
      expect(clonedPolicy.isDraft()).toBe(true)
      expect(clonedPolicy.createdAt.getTime()).toBeGreaterThan(originalPolicy.createdAt.getTime())
    })
  })

  describe('例外・制約違反', () => {
    it('activate() - 既に有効化されたポリシーを再度有効化しようとするとエラーになる', () => {
      const policy = new PrivacyPolicy(
        1,
        'テストコンテンツ',
        new Date('2024-01-15T00:00:00Z'), // 既に有効化済み
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      )

      expect(() => {
        policy.activate(new Date('2024-01-20T00:00:00Z'))
      }).toThrow('このポリシーは既に有効化されています')
    })

    it('updateContent() - 有効化されたポリシーのコンテンツを更新しようとするとエラーになる', () => {
      const policy = new PrivacyPolicy(
        1,
        'テストコンテンツ',
        new Date('2024-01-15T00:00:00Z'), // 既に有効化済み
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z'),
      )

      expect(() => {
        policy.updateContent('新しいコンテンツ')
      }).toThrow('有効化されたポリシーは編集できません')
    })
  })
})
