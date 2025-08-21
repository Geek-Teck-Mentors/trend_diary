import { describe, expect, it } from 'vitest'
import { isActive } from '../schema/method'
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
        expect(policy).toBeDefined()
        expect(policy.version).toBe(1)
        expect(policy.content).toBe('プライバシーポリシーの内容')
        expect(policy.effectiveAt).toEqual(new Date('2024-01-15T00:00:00Z'))
        expect(policy.createdAt).toEqual(new Date('2024-01-01T00:00:00Z'))
        expect(policy.updatedAt).toEqual(new Date('2024-01-01T00:00:00Z'))
      })

      it('下書き状態のDBレコードを変換できる', () => {
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
        expect(policy).toBeDefined()
        expect(policy.version).toBe(2)
        expect(policy.content).toBe('下書きポリシー')
        expect(policy.effectiveAt).toBeNull()
        expect(isActive(policy)).toBe(false)
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
        expect(policy).toBeDefined()
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
        expect(policy).toBeDefined()
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
        expect(policy).toBeDefined()
        expect(policy.content).toBe(longContent)
      })
    })
  })
})
