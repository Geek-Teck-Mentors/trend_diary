import { describe, expect, it } from 'vitest'
import PrivacyPolicy from '../model/privacyPolicy'
import { mapToPrivacyPolicy } from './mapper'

describe('mapper', () => {
  describe('mapToPrivacyPolicy', () => {
    describe('基本動作', () => {
      it('DBレコードからPrivacyPolicyエンティティに変換できる', () => {
        // Arrange
        const dbRecord = {
          version: 1,
          content: 'プライバシーポリシーの内容',
          effectiveAt: new Date('2024-01-15T00:00:00Z'),
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z'),
        }

        // Act
        const policy = mapToPrivacyPolicy(dbRecord)

        // Assert
        expect(policy).toBeInstanceOf(PrivacyPolicy)
        expect(policy.version).toBe(1)
        expect(policy.content).toBe('プライバシーポリシーの内容')
        expect(policy.effectiveAt).toEqual(new Date('2024-01-15T00:00:00Z'))
        expect(policy.createdAt).toEqual(new Date('2024-01-01T00:00:00Z'))
        expect(policy.updatedAt).toEqual(new Date('2024-01-01T00:00:00Z'))
      })

      it('下書き状態（effectiveAt=null）のDBレコードを変換できる', () => {
        // Arrange
        const dbRecord = {
          version: 2,
          content: '下書きポリシー',
          effectiveAt: null,
          createdAt: new Date('2024-01-02T00:00:00Z'),
          updatedAt: new Date('2024-01-02T00:00:00Z'),
        }

        // Act
        const policy = mapToPrivacyPolicy(dbRecord)

        // Assert
        expect(policy).toBeInstanceOf(PrivacyPolicy)
        expect(policy.version).toBe(2)
        expect(policy.content).toBe('下書きポリシー')
        expect(policy.effectiveAt).toBeNull()
        expect(policy.isDraft()).toBe(true)
        expect(policy.isActive()).toBe(false)
      })
    })

    describe('境界値・特殊値', () => {
      it('空のコンテンツでも変換できる', () => {
        // Arrange
        const dbRecord = {
          version: 1,
          content: '',
          effectiveAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        // Act
        const policy = mapToPrivacyPolicy(dbRecord)

        // Assert
        expect(policy).toBeInstanceOf(PrivacyPolicy)
        expect(policy.content).toBe('')
      })

      it('version=0でも変換できる', () => {
        // Arrange
        const dbRecord = {
          version: 0,
          content: '初期ポリシー',
          effectiveAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        // Act
        const policy = mapToPrivacyPolicy(dbRecord)

        // Assert
        expect(policy).toBeInstanceOf(PrivacyPolicy)
        expect(policy.version).toBe(0)
      })

      it('非常に長いコンテンツでも変換できる', () => {
        // Arrange
        const longContent = 'a'.repeat(100000)
        const dbRecord = {
          version: 1,
          content: longContent,
          effectiveAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        // Act
        const policy = mapToPrivacyPolicy(dbRecord)

        // Assert
        expect(policy).toBeInstanceOf(PrivacyPolicy)
        expect(policy.content).toBe(longContent)
      })
    })

    describe('例外・制約違反', () => {
      it('変換されたエンティティのメソッドが正常に動作する', () => {
        // Arrange
        const dbRecord = {
          version: 1,
          content: 'テストコンテンツ',
          effectiveAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        // Act
        const policy = mapToPrivacyPolicy(dbRecord)

        // Assert - エンティティのメソッドが正常に呼び出せることを確認
        expect(policy.isDraft()).toBe(true)
        expect(policy.isActive()).toBe(false)

        // updateContentメソッドも正常に動作することを確認
        const newContent = '更新されたコンテンツ'
        policy.updateContent(newContent)
        expect(policy.content).toBe(newContent)
      })
    })
  })
})
