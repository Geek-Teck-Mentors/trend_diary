import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ClientError, NotFoundError } from '@/common/errors'
import { isError, isSuccess, resultError, resultSuccess } from '@/common/types/utility'
import PrivacyPolicyService from './privacyPolicyService'

// モックリポジトリインターフェースの型定義
interface MockQueryService {
  findAll: ReturnType<typeof vi.fn>
  findByVersion: ReturnType<typeof vi.fn>
  getLatestDraft: ReturnType<typeof vi.fn>
  getNextVersion: ReturnType<typeof vi.fn>
}

interface MockCommandService {
  save: ReturnType<typeof vi.fn>
  deleteByVersion: ReturnType<typeof vi.fn>
}

describe('PrivacyPolicyService', () => {
  let service: PrivacyPolicyService
  let mockQueryService: MockQueryService
  let mockCommandService: MockCommandService

  beforeEach(() => {
    mockQueryService = {
      findAll: vi.fn(),
      findByVersion: vi.fn(),
      getLatestDraft: vi.fn(),
      getNextVersion: vi.fn(),
    }

    mockCommandService = {
      save: vi.fn(),
      deleteByVersion: vi.fn(),
    }

    service = new PrivacyPolicyService(mockQueryService as any, mockCommandService as any)
  })

  describe('getAllPolicies', () => {
    describe('基本動作', () => {
      it('全てのプライバシーポリシーを取得できる', async () => {
        const policies = [
          new PrivacyPolicy(1, 'コンテンツ1', new Date(), new Date(), new Date()),
          new PrivacyPolicy(2, 'コンテンツ2', null, new Date(), new Date()),
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
        mockQueryService.findAll.mockResolvedValue(resultSuccess(paginationResult))

        const result = await service.getAllPolicies(1, 10)

        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toEqual(paginationResult)
        }
        expect(mockQueryService.findAll).toHaveBeenCalledWith(1, 10)
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
        mockQueryService.findAll.mockResolvedValue(resultSuccess(emptyResult))

        const result = await service.getAllPolicies(1, 10)

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
        mockQueryService.findAll.mockResolvedValue(resultSuccess(emptyResult))

        const result = await service.getAllPolicies(0, 0)

        expect(isSuccess(result)).toBe(true)
        expect(mockQueryService.findAll).toHaveBeenCalledWith(0, 0)
      })
    })

    describe('例外・制約違反', () => {
      it('リポジトリでエラーが発生した場合はエラーを返す', async () => {
        const error = new Error('データベースエラー')
        mockQueryService.findAll.mockResolvedValue(resultError(error))

        const result = await service.getAllPolicies(1, 10)

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
        const policy = new PrivacyPolicy(1, 'コンテンツ1', null, new Date(), new Date())
        mockQueryService.findByVersion.mockResolvedValue(resultSuccess(policy))

        const result = await service.getPolicyByVersion(1)

        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toEqual(policy)
        }
        expect(mockQueryService.findByVersion).toHaveBeenCalledWith(1)
      })
    })

    describe('例外・制約違反', () => {
      it('存在しないバージョンを指定した場合はNotFoundErrorを返す', async () => {
        const version = 999
        mockQueryService.findByVersion.mockResolvedValue(resultSuccess(null))

        const result = await service.getPolicyByVersion(version)

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
        mockQueryService.findByVersion.mockResolvedValue(resultError(error))

        const result = await service.getPolicyByVersion(version)

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
        const createdPolicy = new PrivacyPolicy(nextVersion, content, null, new Date(), new Date())

        mockQueryService.getNextVersion.mockResolvedValue(resultSuccess(nextVersion))
        mockCommandService.save.mockResolvedValue(resultSuccess(createdPolicy))

        const result = await service.createPolicy(content)

        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toEqual(createdPolicy)
        }
        expect(mockQueryService.getNextVersion).toHaveBeenCalled()
        expect(mockCommandService.save).toHaveBeenCalledWith(
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
        const createdPolicy = new PrivacyPolicy(nextVersion, content, null, new Date(), new Date())

        mockQueryService.getNextVersion.mockResolvedValue(resultSuccess(nextVersion))
        mockCommandService.save.mockResolvedValue(resultSuccess(createdPolicy))

        const result = await service.createPolicy(content)

        expect(isSuccess(result)).toBe(true)
      })
    })
  })

  describe('updatePolicy', () => {
    describe('基本動作', () => {
      it('下書き状態のプライバシーポリシーを更新できる', async () => {
        const version = 1
        const newContent = '更新されたコンテンツ'
        const draftPolicy = new PrivacyPolicy(
          version,
          '古いコンテンツ',
          null,
          new Date(),
          new Date(),
        )

        mockQueryService.findByVersion.mockResolvedValue(resultSuccess(draftPolicy))

        // 更新されたポリシーを返すようにモック設定
        const updatedPolicy = new PrivacyPolicy(
          version,
          newContent,
          null,
          draftPolicy.createdAt,
          new Date(),
        )
        mockCommandService.save.mockResolvedValue(resultSuccess(updatedPolicy))

        const result = await service.updatePolicy(version, newContent)

        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.content).toBe(newContent)
        }
        expect(mockQueryService.findByVersion).toHaveBeenCalledWith(version)
        expect(mockCommandService.save).toHaveBeenCalled()
      })
    })

    describe('例外・制約違反', () => {
      it('存在しないポリシーを更新しようとした場合はNotFoundErrorを返す', async () => {
        const version = 999
        mockQueryService.findByVersion.mockResolvedValue(resultSuccess(null))

        const result = await service.updatePolicy(version, '新しいコンテンツ')

        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error).toBeInstanceOf(NotFoundError)
        }
      })

      it('有効化されたポリシーを更新しようとした場合はClientErrorを返す', async () => {
        const version = 1
        const activePolicy = new PrivacyPolicy(
          version,
          'コンテンツ',
          new Date(),
          new Date(),
          new Date(),
        )
        mockQueryService.findByVersion.mockResolvedValue(resultSuccess(activePolicy))

        const result = await service.updatePolicy(version, '新しいコンテンツ')

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
        const draftPolicy = new PrivacyPolicy(version, 'コンテンツ', null, new Date(), new Date())

        mockQueryService.findByVersion.mockResolvedValue(resultSuccess(draftPolicy))
        mockCommandService.deleteByVersion.mockResolvedValue(resultSuccess(undefined))

        const result = await service.deletePolicy(version)

        expect(isSuccess(result)).toBe(true)
        expect(mockQueryService.findByVersion).toHaveBeenCalledWith(version)
        expect(mockCommandService.deleteByVersion).toHaveBeenCalledWith(version)
      })
    })

    describe('例外・制約違反', () => {
      it('存在しないポリシーを削除しようとした場合はNotFoundErrorを返す', async () => {
        const version = 999
        mockQueryService.findByVersion.mockResolvedValue(resultSuccess(null))

        const result = await service.deletePolicy(version)

        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error).toBeInstanceOf(NotFoundError)
        }
      })

      it('有効化されたポリシーを削除しようとした場合はClientErrorを返す', async () => {
        const version = 1
        const activePolicy = new PrivacyPolicy(
          version,
          'コンテンツ',
          new Date(),
          new Date(),
          new Date(),
        )
        mockQueryService.findByVersion.mockResolvedValue(resultSuccess(activePolicy))

        const result = await service.deletePolicy(version)

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
        const sourcePolicy = new PrivacyPolicy(
          sourceVersion,
          '元のコンテンツ',
          new Date(),
          new Date(),
          new Date(),
        )
        const clonedPolicy = new PrivacyPolicy(
          nextVersion,
          '元のコンテンツ',
          null,
          new Date(),
          new Date(),
        )

        mockQueryService.findByVersion.mockResolvedValue(resultSuccess(sourcePolicy))
        mockQueryService.getNextVersion.mockResolvedValue(resultSuccess(nextVersion))
        mockCommandService.save.mockResolvedValue(resultSuccess(clonedPolicy))

        const result = await service.clonePolicy(sourceVersion)

        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.version).toBe(nextVersion)
          expect(result.data.content).toBe(sourcePolicy.content)
          expect(result.data.effectiveAt).toBeNull()
        }
        expect(mockQueryService.findByVersion).toHaveBeenCalledWith(sourceVersion)
        expect(mockQueryService.getNextVersion).toHaveBeenCalled()
        expect(mockCommandService.save).toHaveBeenCalled()
      })
    })

    describe('例外・制約違反', () => {
      it('存在しないポリシーを複製しようとした場合はNotFoundErrorを返す', async () => {
        const sourceVersion = 999
        mockQueryService.findByVersion.mockResolvedValue(resultSuccess(null))

        const result = await service.clonePolicy(sourceVersion)

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
        const draftPolicy = new PrivacyPolicy(version, 'コンテンツ', null, new Date(), new Date())

        mockQueryService.findByVersion.mockResolvedValue(resultSuccess(draftPolicy))

        // 有効化されたポリシーを返すようにモック設定
        const activatedPolicy = new PrivacyPolicy(
          version,
          'コンテンツ',
          effectiveDate,
          draftPolicy.createdAt,
          new Date(),
        )
        mockCommandService.save.mockResolvedValue(resultSuccess(activatedPolicy))

        const result = await service.activatePolicy(version, effectiveDate)

        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.effectiveAt).toEqual(effectiveDate)
          expect(result.data.effectiveAt !== null).toBe(true) // isActive logic
        }
        expect(mockQueryService.findByVersion).toHaveBeenCalledWith(version)
        expect(mockCommandService.save).toHaveBeenCalled()
      })
    })

    describe('例外・制約違反', () => {
      it('存在しないポリシーを有効化しようとした場合はNotFoundErrorを返す', async () => {
        const version = 999
        mockQueryService.findByVersion.mockResolvedValue(resultSuccess(null))

        const result = await service.activatePolicy(version, new Date())

        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error).toBeInstanceOf(NotFoundError)
        }
      })

      it('既に有効化されたポリシーを再度有効化しようとした場合はClientErrorを返す', async () => {
        const version = 1
        const activePolicy = new PrivacyPolicy(
          version,
          'コンテンツ',
          new Date(),
          new Date(),
          new Date(),
        )
        mockQueryService.findByVersion.mockResolvedValue(resultSuccess(activePolicy))

        const result = await service.activatePolicy(version, new Date())

        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error).toBeInstanceOf(ClientError)
          expect(result.error.message).toBe('このポリシーは既に有効化されています')
        }
      })
    })
  })
})
