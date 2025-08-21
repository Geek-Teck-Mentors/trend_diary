import { PrismaClient } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { isError, isSuccess } from '@/common/types/utility'
import QueryServiceImpl from './queryServiceImpl'

// モックの設定
const mockDb = mockDeep<PrismaClient>()

describe('QueryServiceImpl', () => {
  let useCase: QueryServiceImpl

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new QueryServiceImpl(mockDb)
  })

  describe('findAll', () => {
    describe('基本動作', () => {
      it('全てのプライバシーポリシーを取得できる', async () => {
        // Arrange
        const page = 1
        const limit = 10
        const mockPolicies = [
          {
            version: 1,
            content: 'ポリシー1',
            effectiveAt: new Date('2024-01-01'),
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
          {
            version: 2,
            content: 'ポリシー2',
            effectiveAt: null,
            createdAt: new Date('2024-01-02'),
            updatedAt: new Date('2024-01-02'),
          },
        ]

        mockDb.privacyPolicy.findMany.mockResolvedValue(mockPolicies)
        mockDb.privacyPolicy.count.mockResolvedValue(2)

        // Act
        const result = await useCase.findAll(page, limit)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.data).toHaveLength(2)
          expect(result.data.data[0]).toBeDefined()
          expect(result.data.data[0].version).toBe(1)
          expect(result.data.data[1].version).toBe(2)
          expect(result.data.page).toBe(1)
          expect(result.data.limit).toBe(10)
          expect(result.data.total).toBe(2)
          expect(result.data.totalPages).toBe(1)
          expect(result.data.hasNext).toBe(false)
          expect(result.data.hasPrev).toBe(false)
        }
        expect(mockDb.privacyPolicy.findMany).toHaveBeenCalledWith({
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { version: 'desc' },
        })
        expect(mockDb.privacyPolicy.count).toHaveBeenCalled()
      })
    })

    describe('境界値・特殊値', () => {
      it('空の結果でも正常に処理できる', async () => {
        // Arrange
        mockDb.privacyPolicy.findMany.mockResolvedValue([])
        mockDb.privacyPolicy.count.mockResolvedValue(0)

        // Act
        const result = await useCase.findAll(1, 10)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.data).toEqual([])
          expect(result.data.total).toBe(0)
          expect(result.data.totalPages).toBe(0)
          expect(result.data.hasNext).toBe(false)
          expect(result.data.hasPrev).toBe(false)
        }
      })

      it('page=0, limit=0でも処理できる', async () => {
        // Arrange
        mockDb.privacyPolicy.findMany.mockResolvedValue([])
        mockDb.privacyPolicy.count.mockResolvedValue(0)

        // Act
        const result = await useCase.findAll(0, 0)

        // Assert
        expect(isSuccess(result)).toBe(true)
        expect(mockDb.privacyPolicy.findMany).toHaveBeenCalledWith({
          skip: -0, // (0 - 1) * 0 = -0
          take: 0,
          orderBy: { version: 'desc' },
        })
        expect(mockDb.privacyPolicy.count).toHaveBeenCalled()
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラーが発生した場合はエラーを返す', async () => {
        // Arrange
        const error = new Error('データベース接続エラー')
        mockDb.privacyPolicy.findMany.mockRejectedValue(error)

        // Act
        const result = await useCase.findAll(1, 10)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe(error.message)
        }
      })
    })
  })

  describe('findByVersion', () => {
    describe('基本動作', () => {
      it('指定したバージョンのプライバシーポリシーを取得できる', async () => {
        // Arrange
        const version = 1
        const mockPolicy = {
          version: 1,
          content: 'ポリシー内容',
          effectiveAt: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        }

        mockDb.privacyPolicy.findUnique.mockResolvedValue(mockPolicy)

        // Act
        const result = await useCase.findByVersion(version)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBeDefined()
          expect(result.data?.version).toBe(1)
          expect(result.data?.content).toBe('ポリシー内容')
        }
        expect(mockDb.privacyPolicy.findUnique).toHaveBeenCalledWith({
          where: { version },
        })
      })
    })

    describe('境界値・特殊値', () => {
      it('存在しないバージョンを指定した場合はnullを返す', async () => {
        // Arrange
        const version = 999
        mockDb.privacyPolicy.findUnique.mockResolvedValue(null)

        // Act
        const result = await useCase.findByVersion(version)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBeNull()
        }
      })

      it('version=0でも処理できる', async () => {
        // Arrange
        const version = 0
        const mockPolicy = {
          version: 0,
          content: '初期ポリシー',
          effectiveAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        mockDb.privacyPolicy.findUnique.mockResolvedValue(mockPolicy)

        // Act
        const result = await useCase.findByVersion(version)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data?.version).toBe(0)
        }
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラーが発生した場合はエラーを返す', async () => {
        // Arrange
        const error = new Error('データベース接続エラー')
        mockDb.privacyPolicy.findUnique.mockRejectedValue(error)

        // Act
        const result = await useCase.findByVersion(1)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe(error.message)
        }
      })
    })
  })

  describe('getLatestDraft', () => {
    describe('基本動作', () => {
      it('最新の下書きプライバシーポリシーを取得できる', async () => {
        // Arrange
        const mockDraftPolicy = {
          version: 3,
          content: '下書きポリシー',
          effectiveAt: null,
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-03'),
        }

        mockDb.privacyPolicy.findFirst.mockResolvedValue(mockDraftPolicy)

        // Act
        const result = await useCase.getLatestDraft()

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBeDefined()
          expect(result.data?.version).toBe(3)
          expect(result.data?.effectiveAt).toBeNull()
        }
        expect(mockDb.privacyPolicy.findFirst).toHaveBeenCalledWith({
          where: { effectiveAt: null },
          orderBy: { version: 'desc' },
        })
      })
    })

    describe('境界値・特殊値', () => {
      it('下書きポリシーが存在しない場合はnullを返す', async () => {
        // Arrange
        mockDb.privacyPolicy.findFirst.mockResolvedValue(null)

        // Act
        const result = await useCase.getLatestDraft()

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBeNull()
        }
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラーが発生した場合はエラーを返す', async () => {
        // Arrange
        const error = new Error('データベース接続エラー')
        mockDb.privacyPolicy.findFirst.mockRejectedValue(error)

        // Act
        const result = await useCase.getLatestDraft()

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe(error.message)
        }
      })
    })
  })

  describe('getNextVersion', () => {
    describe('基本動作', () => {
      it('次のバージョン番号を取得できる', async () => {
        // Arrange
        const mockMaxPolicy = {
          version: 5,
          content: '最新ポリシー',
          effectiveAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        mockDb.privacyPolicy.findFirst.mockResolvedValue(mockMaxPolicy)

        // Act
        const result = await useCase.getNextVersion()

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBe(6)
        }
        expect(mockDb.privacyPolicy.findFirst).toHaveBeenCalledWith({
          orderBy: { version: 'desc' },
        })
      })
    })

    describe('境界値・特殊値', () => {
      it('ポリシーが存在しない場合は1を返す', async () => {
        // Arrange
        mockDb.privacyPolicy.findFirst.mockResolvedValue(null)

        // Act
        const result = await useCase.getNextVersion()

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBe(1)
        }
      })

      it('最大バージョンが0の場合は1を返す', async () => {
        // Arrange
        const mockMaxPolicy = {
          version: 0,
          content: '初期ポリシー',
          effectiveAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        mockDb.privacyPolicy.findFirst.mockResolvedValue(mockMaxPolicy)

        // Act
        const result = await useCase.getNextVersion()

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBe(1)
        }
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラーが発生した場合はエラーを返す', async () => {
        // Arrange
        const error = new Error('データベース接続エラー')
        mockDb.privacyPolicy.findFirst.mockRejectedValue(error)

        // Act
        const result = await useCase.getNextVersion()

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe(error.message)
        }
      })
    })
  })
})
