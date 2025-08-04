import { PrismaClient } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { isError, isSuccess } from '@/common/types/utility'
import PrivacyPolicy from '../model/privacyPolicy'
import CommandServiceImpl from './commandServiceImpl'

// モックの設定
const mockDb = mockDeep<PrismaClient>()

describe('CommandServiceImpl', () => {
  let service: CommandServiceImpl

  beforeEach(() => {
    vi.clearAllMocks()
    service = new CommandServiceImpl(mockDb)
  })

  describe('save', () => {
    describe('基本動作', () => {
      it('新しいプライバシーポリシーを保存できる', async () => {
        // Arrange
        const policy = new PrivacyPolicy(
          1,
          'プライバシーポリシー内容',
          null,
          new Date('2024-01-01'),
          new Date('2024-01-01'),
        )

        const mockSavedPolicy = {
          version: 1,
          content: 'プライバシーポリシー内容',
          effectiveAt: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        }

        mockDb.privacyPolicy.upsert.mockResolvedValue(mockSavedPolicy)

        // Act
        const result = await service.save(policy)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBeInstanceOf(PrivacyPolicy)
          expect(result.data.version).toBe(1)
          expect(result.data.content).toBe('プライバシーポリシー内容')
          expect(result.data.effectiveAt).toBeNull()
        }
        expect(mockDb.privacyPolicy.upsert).toHaveBeenCalledWith({
          where: { version: 1 },
          update: {
            content: 'プライバシーポリシー内容',
            effectiveAt: null,
            updatedAt: policy.updatedAt,
          },
          create: {
            version: 1,
            content: 'プライバシーポリシー内容',
            effectiveAt: null,
            createdAt: policy.createdAt,
            updatedAt: policy.updatedAt,
          },
        })
      })

      it('既存のプライバシーポリシーを更新できる', async () => {
        // Arrange
        const policy = new PrivacyPolicy(
          2,
          '更新されたポリシー内容',
          new Date('2024-01-15'),
          new Date('2024-01-01'),
          new Date('2024-01-15'),
        )

        const mockUpdatedPolicy = {
          version: 2,
          content: '更新されたポリシー内容',
          effectiveAt: new Date('2024-01-15'),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15'),
        }

        mockDb.privacyPolicy.upsert.mockResolvedValue(mockUpdatedPolicy)

        // Act
        const result = await service.save(policy)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBeInstanceOf(PrivacyPolicy)
          expect(result.data.version).toBe(2)
          expect(result.data.content).toBe('更新されたポリシー内容')
          expect(result.data.effectiveAt).toEqual(new Date('2024-01-15'))
        }
      })
    })

    describe('境界値・特殊値', () => {
      it('空のコンテンツでも保存できる', async () => {
        // Arrange
        const policy = new PrivacyPolicy(1, '', null, new Date(), new Date())

        const mockSavedPolicy = {
          version: 1,
          content: '',
          effectiveAt: null,
          createdAt: policy.createdAt,
          updatedAt: policy.updatedAt,
        }

        mockDb.privacyPolicy.upsert.mockResolvedValue(mockSavedPolicy)

        // Act
        const result = await service.save(policy)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.content).toBe('')
        }
      })

      it('version=0でも保存できる', async () => {
        // Arrange
        const policy = new PrivacyPolicy(0, '初期ポリシー', null, new Date(), new Date())

        const mockSavedPolicy = {
          version: 0,
          content: '初期ポリシー',
          effectiveAt: null,
          createdAt: policy.createdAt,
          updatedAt: policy.updatedAt,
        }

        mockDb.privacyPolicy.upsert.mockResolvedValue(mockSavedPolicy)

        // Act
        const result = await service.save(policy)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.version).toBe(0)
        }
      })

      it('非常に長いコンテンツでも保存できる', async () => {
        // Arrange
        const longContent = 'a'.repeat(100000) // 10万文字
        const policy = new PrivacyPolicy(1, longContent, null, new Date(), new Date())

        const mockSavedPolicy = {
          version: 1,
          content: longContent,
          effectiveAt: null,
          createdAt: policy.createdAt,
          updatedAt: policy.updatedAt,
        }

        mockDb.privacyPolicy.upsert.mockResolvedValue(mockSavedPolicy)

        // Act
        const result = await service.save(policy)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.content).toBe(longContent)
        }
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラーが発生した場合はエラーを返す', async () => {
        // Arrange
        const policy = new PrivacyPolicy(1, 'テストポリシー', null, new Date(), new Date())

        const error = new Error('データベース制約違反')
        mockDb.privacyPolicy.upsert.mockRejectedValue(error)

        // Act
        const result = await service.save(policy)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe(error.message)
        }
      })

      it('制約違反エラーが発生した場合はエラーを返す', async () => {
        // Arrange
        const policy = new PrivacyPolicy(1, 'テストポリシー', null, new Date(), new Date())

        const constraintError = new Error('UNIQUE constraint failed')
        mockDb.privacyPolicy.upsert.mockRejectedValue(constraintError)

        // Act
        const result = await service.save(policy)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe(constraintError.message)
        }
      })
    })
  })

  describe('deleteByVersion', () => {
    describe('基本動作', () => {
      it('指定したバージョンのプライバシーポリシーを削除できる', async () => {
        // Arrange
        const version = 1

        const mockDeletedPolicy = {
          version: 1,
          content: '削除されるポリシー',
          effectiveAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        mockDb.privacyPolicy.delete.mockResolvedValue(mockDeletedPolicy)

        // Act
        const result = await service.deleteByVersion(version)

        // Assert
        expect(isSuccess(result)).toBe(true)
        expect(mockDb.privacyPolicy.delete).toHaveBeenCalledWith({
          where: { version },
        })
      })
    })

    describe('境界値・特殊値', () => {
      it('version=0でも削除できる', async () => {
        // Arrange
        const version = 0

        const mockDeletedPolicy = {
          version: 0,
          content: '初期ポリシー',
          effectiveAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        mockDb.privacyPolicy.delete.mockResolvedValue(mockDeletedPolicy)

        // Act
        const result = await service.deleteByVersion(version)

        // Assert
        expect(isSuccess(result)).toBe(true)
        expect(mockDb.privacyPolicy.delete).toHaveBeenCalledWith({
          where: { version: 0 },
        })
      })
    })

    describe('例外・制約違反', () => {
      it('存在しないバージョンを削除しようとした場合はエラーを返す', async () => {
        // Arrange
        const version = 999
        const error = new Error('Record to delete does not exist')
        mockDb.privacyPolicy.delete.mockRejectedValue(error)

        // Act
        const result = await service.deleteByVersion(version)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe(error.message)
        }
      })

      it('データベースエラーが発生した場合はエラーを返す', async () => {
        // Arrange
        const version = 1
        const error = new Error('データベース接続エラー')
        mockDb.privacyPolicy.delete.mockRejectedValue(error)

        // Act
        const result = await service.deleteByVersion(version)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe(error.message)
        }
      })

      it('外部キー制約違反が発生した場合はエラーを返す', async () => {
        // Arrange
        const version = 1
        const constraintError = new Error('Foreign key constraint failed')
        mockDb.privacyPolicy.delete.mockRejectedValue(constraintError)

        // Act
        const result = await service.deleteByVersion(version)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe(constraintError.message)
        }
      })
    })
  })
})
