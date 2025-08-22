import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ClientError, NotFoundError } from '@/common/errors'
import { isError, isSuccess, resultError, resultSuccess } from '@/common/types/utility'
import { isActive } from './schema/method'
import { UseCase } from './useCase'

// モックリポジトリインターフェースの型定義
interface MockQuery {
  findAll: ReturnType<typeof vi.fn>
  findByVersion: ReturnType<typeof vi.fn>
  getLatestDraft: ReturnType<typeof vi.fn>
  getNextVersion: ReturnType<typeof vi.fn>
}

interface MockCommand {
  save: ReturnType<typeof vi.fn>
  deleteByVersion: ReturnType<typeof vi.fn>
}

describe('PrivacyPolicyService', () => {
  let useCase: UseCase
  let mockQuery: MockQuery
  let mockCommand: MockCommand

  beforeEach(() => {
    mockQuery = {
      findAll: vi.fn(),
      findByVersion: vi.fn(),
      getLatestDraft: vi.fn(),
      getNextVersion: vi.fn(),
    }

    mockCommand = {
      save: vi.fn(),
      deleteByVersion: vi.fn(),
    }

    useCase = new UseCase(mockQuery, mockCommand)
  })

  describe('getAllPolicies', () => {
    describe('基本動作', () => {
      it('全てのプライバシーポリシーを取得できる', async () => {
        const policies = [
          {
            version: 1,
            content: 'コンテンツ1',
            effectiveAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            version: 2,
            content: 'コンテンツ2',
            effectiveAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]
        const paginationResult = {
          data: policies,
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        }
        mockQuery.findAll.mockResolvedValue(resultSuccess(paginationResult))

        const result = await useCase.getAllPolicies(1, 10)

        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toEqual(paginationResult)
        }
        expect(mockQuery.findAll).toHaveBeenCalledWith(1, 10)
      })
    })

    describe('境界値・特殊値', () => {
      it('空のリストを取得した場合でも正常に処理できる', async () => {
        const emptyResult = {
          data: [],
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        }
        mockQuery.findAll.mockResolvedValue(resultSuccess(emptyResult))

        const result = await useCase.getAllPolicies(1, 10)

        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toEqual(emptyResult)
        }
      })

      it('page=0, limit=0でも処理できる', async () => {
        const emptyResult = {
          data: [],
          page: 0,
          limit: 0,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        }
        mockQuery.findAll.mockResolvedValue(resultSuccess(emptyResult))

        const result = await useCase.getAllPolicies(0, 0)

        expect(isSuccess(result)).toBe(true)
        expect(mockQuery.findAll).toHaveBeenCalledWith(0, 0)
      })
    })

    describe('例外・制約違反', () => {
      it('リポジトリでエラーが発生した場合はエラーを返す', async () => {
        const error = new Error('データベースエラー')
        mockQuery.findAll.mockResolvedValue(resultError(error))

        const result = await useCase.getAllPolicies(1, 10)

        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe('データベースエラー')
        }
      })
    })
  })

  describe('getPolicyByVersion', () => {
    describe('基本動作', () => {
      it('指定したバージョンのプライバシーポリシーを取得できる', async () => {
        const policy = {
          version: 1,
          content: 'コンテンツ1',
          effectiveAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        mockQuery.findByVersion.mockResolvedValue(resultSuccess(policy))

        const result = await useCase.getPolicyByVersion(1)

        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toEqual(policy)
        }
        expect(mockQuery.findByVersion).toHaveBeenCalledWith(1)
      })
    })

    describe('例外・制約違反', () => {
      it('存在しないバージョンを指定した場合はNotFoundErrorを返す', async () => {
        const version = 999
        mockQuery.findByVersion.mockResolvedValue(resultSuccess(null))

        const result = await useCase.getPolicyByVersion(version)

        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error).toBeInstanceOf(NotFoundError)
          expect(result.error.message).toBe(
            '指定されたバージョンのプライバシーポリシーが見つかりません',
          )
        }
      })

      it('リポジトリでエラーが発生した場合はエラーを返す', async () => {
        const version = 1
        const error = new Error('データベースエラー')
        mockQuery.findByVersion.mockResolvedValue(resultError(error))

        const result = await useCase.getPolicyByVersion(version)

        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe('データベースエラー')
        }
      })
    })
  })

  describe('createPolicy', () => {
    describe('基本動作', () => {
      it('新しいプライバシーポリシーを作成できる', async () => {
        const content = '新しいプライバシーポリシー'
        const nextVersion = 1
        const createdPolicy = {
          version: nextVersion,
          content,
          effectiveAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        mockQuery.getNextVersion.mockResolvedValue(resultSuccess(nextVersion))
        mockCommand.save.mockResolvedValue(resultSuccess(createdPolicy))

        const result = await useCase.createPolicy(content)

        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toEqual(createdPolicy)
        }
        expect(mockQuery.getNextVersion).toHaveBeenCalled()
        expect(mockCommand.save).toHaveBeenCalledWith(
          expect.objectContaining({
            version: nextVersion,
            content,
            effectiveAt: null,
          }),
        )
      })
    })

    describe('境界値・特殊値', () => {
      it('空のコンテンツでもポリシーを作成できる', async () => {
        const content = ''
        const nextVersion = 1
        const createdPolicy = {
          version: nextVersion,
          content,
          effectiveAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        mockQuery.getNextVersion.mockResolvedValue(resultSuccess(nextVersion))
        mockCommand.save.mockResolvedValue(resultSuccess(createdPolicy))

        const result = await useCase.createPolicy(content)

        expect(isSuccess(result)).toBe(true)
      })
    })
  })

  describe('updatePolicy', () => {
    describe('基本動作', () => {
      it('下書き状態のプライバシーポリシーを更新できる', async () => {
        const version = 1
        const newContent = '更新されたコンテンツ'
        const draftPolicy = {
          version,
          content: '古いコンテンツ',
          effectiveAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        mockQuery.findByVersion.mockResolvedValue(resultSuccess(draftPolicy))

        // 更新されたポリシーを返すようにモック設定
        const updatedPolicy = {
          version,
          content: newContent,
          effectiveAt: null,
          createdAt: draftPolicy.createdAt,
          updatedAt: new Date(),
        }
        mockCommand.save.mockResolvedValue(resultSuccess(updatedPolicy))

        const result = await useCase.updatePolicy(version, newContent)

        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.content).toBe(newContent)
        }
        expect(mockQuery.findByVersion).toHaveBeenCalledWith(version)
        expect(mockCommand.save).toHaveBeenCalled()
      })
    })

    describe('例外・制約違反', () => {
      it('存在しないポリシーを更新しようとした場合はNotFoundErrorを返す', async () => {
        const version = 999
        mockQuery.findByVersion.mockResolvedValue(resultSuccess(null))

        const result = await useCase.updatePolicy(version, '新しいコンテンツ')

        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error).toBeInstanceOf(NotFoundError)
        }
      })

      it('有効化されたポリシーを更新しようとした場合はClientErrorを返す', async () => {
        const version = 1
        const activePolicy = {
          version,
          content: 'コンテンツ',
          effectiveAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        mockQuery.findByVersion.mockResolvedValue(resultSuccess(activePolicy))

        const result = await useCase.updatePolicy(version, '新しいコンテンツ')

        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error).toBeInstanceOf(ClientError)
          expect(result.error.message).toBe('有効化されたポリシーは更新できません')
        }
      })
    })
  })

  describe('deletePolicy', () => {
    describe('基本動作', () => {
      it('下書き状態のプライバシーポリシーを削除できる', async () => {
        const version = 1
        const draftPolicy = {
          version,
          content: 'コンテンツ',
          effectiveAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        mockQuery.findByVersion.mockResolvedValue(resultSuccess(draftPolicy))
        mockCommand.deleteByVersion.mockResolvedValue(resultSuccess(undefined))

        const result = await useCase.deletePolicy(version)

        expect(isSuccess(result)).toBe(true)
        expect(mockQuery.findByVersion).toHaveBeenCalledWith(version)
        expect(mockCommand.deleteByVersion).toHaveBeenCalledWith(version)
      })
    })

    describe('例外・制約違反', () => {
      it('存在しないポリシーを削除しようとした場合はNotFoundErrorを返す', async () => {
        const version = 999
        mockQuery.findByVersion.mockResolvedValue(resultSuccess(null))

        const result = await useCase.deletePolicy(version)

        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error).toBeInstanceOf(NotFoundError)
        }
      })

      it('有効化されたポリシーを削除しようとした場合はClientErrorを返す', async () => {
        const version = 1
        const activePolicy = {
          version,
          content: 'コンテンツ',
          effectiveAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        mockQuery.findByVersion.mockResolvedValue(resultSuccess(activePolicy))

        const result = await useCase.deletePolicy(version)

        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error).toBeInstanceOf(ClientError)
          expect(result.error.message).toBe('有効化されたポリシーは削除できません')
        }
      })
    })
  })

  describe('clonePolicy', () => {
    describe('基本動作', () => {
      it('既存のプライバシーポリシーを複製できる', async () => {
        const sourceVersion = 1
        const nextVersion = 2
        const sourcePolicy = {
          version: sourceVersion,
          content: '元のコンテンツ',
          effectiveAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        const clonedPolicy = {
          version: nextVersion,
          content: '元のコンテンツ',
          effectiveAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        mockQuery.findByVersion.mockResolvedValue(resultSuccess(sourcePolicy))
        mockQuery.getNextVersion.mockResolvedValue(resultSuccess(nextVersion))
        mockCommand.save.mockResolvedValue(resultSuccess(clonedPolicy))

        const result = await useCase.clonePolicy(sourceVersion)

        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.version).toBe(nextVersion)
          expect(result.data.content).toBe(sourcePolicy.content)
          expect(result.data.effectiveAt).toBeNull()
        }
        expect(mockQuery.findByVersion).toHaveBeenCalledWith(sourceVersion)
        expect(mockQuery.getNextVersion).toHaveBeenCalled()
        expect(mockCommand.save).toHaveBeenCalled()
      })
    })

    describe('例外・制約違反', () => {
      it('存在しないポリシーを複製しようとした場合はNotFoundErrorを返す', async () => {
        const sourceVersion = 999
        mockQuery.findByVersion.mockResolvedValue(resultSuccess(null))

        const result = await useCase.clonePolicy(sourceVersion)

        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error).toBeInstanceOf(NotFoundError)
        }
      })
    })
  })

  describe('activatePolicy', () => {
    describe('基本動作', () => {
      it('下書き状態のプライバシーポリシーを有効化できる', async () => {
        const version = 1
        const effectiveDate = new Date('2024-01-15T00:00:00Z')
        const draftPolicy = {
          version,
          content: 'コンテンツ',
          effectiveAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        mockQuery.findByVersion.mockResolvedValue(resultSuccess(draftPolicy))

        // 有効化されたポリシーを返すようにモック設定
        const activatedPolicy = {
          version,
          content: 'コンテンツ',
          effectiveAt: effectiveDate,
          createdAt: draftPolicy.createdAt,
          updatedAt: new Date(),
        }
        mockCommand.save.mockResolvedValue(resultSuccess(activatedPolicy))

        const result = await useCase.activatePolicy(version, effectiveDate)

        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.effectiveAt).toEqual(effectiveDate)
          expect(isActive(result.data)).toBe(true)
        }
        expect(mockQuery.findByVersion).toHaveBeenCalledWith(version)
        expect(mockCommand.save).toHaveBeenCalled()
      })
    })

    describe('例外・制約違反', () => {
      it('存在しないポリシーを有効化しようとした場合はNotFoundErrorを返す', async () => {
        const version = 999
        mockQuery.findByVersion.mockResolvedValue(resultSuccess(null))

        const result = await useCase.activatePolicy(version, new Date())

        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error).toBeInstanceOf(NotFoundError)
        }
      })

      it('既に有効化されたポリシーを再度有効化しようとした場合はClientErrorを返す', async () => {
        const version = 1
        const activePolicy = {
          version,
          content: 'コンテンツ',
          effectiveAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        mockQuery.findByVersion.mockResolvedValue(resultSuccess(activePolicy))

        const result = await useCase.activatePolicy(version, new Date())

        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error).toBeInstanceOf(ClientError)
          expect(result.error.message).toBe('このポリシーは既に有効化されています')
        }
      })
    })
  })
})
