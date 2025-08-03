import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { RdbClient } from '@/infrastructure/rdb'
import mockPrisma from '@/test/__mocks__/prisma'
import ActiveUserService from '../service/activeUserService'
import createActiveUserService from './activeUserFactory'

// プロジェクトのモック戦略に沿ってmockPrismaを使用
vi.mock('@/test/__mocks__/prisma')

// テーブル駆動テスト用のRdbClientパターン
const rdbClientTestCases = [
  {
    name: 'mockPrismaを使用したRdbClient',
    client: mockPrisma as unknown as RdbClient,
  },
  {
    name: 'mockDeepで作成したRdbClient',
    client: mockDeep<RdbClient>(),
  },
] as const

describe('createActiveUserService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本動作', () => {
    it('プロジェクト標準のmockPrismaでActiveUserServiceインスタンスを正常に作成する', () => {
      // Act
      const service = createActiveUserService(mockPrisma as unknown as RdbClient)

      // Assert
      expect(service).toBeInstanceOf(ActiveUserService)
      expect(service).toBeDefined()
    })

    it.each(rdbClientTestCases)(
      '$nameで正しい型のActiveUserServiceインスタンスを返す',
      ({ client }) => {
        // Act
        const service = createActiveUserService(client)

        // Assert
        expect(service).toBeInstanceOf(ActiveUserService)
        expect(service).toHaveProperty('signup')
        expect(service).toHaveProperty('login')
        expect(service).toHaveProperty('logout')
        expect(service).toHaveProperty('getCurrentUser')

        // 型安全性の検証 - 正確な関数型を持つことを確認
        expect(typeof service.signup).toBe('function')
        expect(typeof service.login).toBe('function')
        expect(typeof service.logout).toBe('function')
        expect(typeof service.getCurrentUser).toBe('function')
      },
    )

    it('作成されたサービスのメソッドが関数として正しく定義されている', () => {
      // Act
      const service = createActiveUserService(mockPrisma as unknown as RdbClient)

      // Assert - 各メソッドが関数として存在することを確認
      expect(typeof service.signup).toBe('function')
      expect(typeof service.login).toBe('function')
      expect(typeof service.logout).toBe('function')
      expect(typeof service.getCurrentUser).toBe('function')

      // メソッドが呼び出し可能であることを確認（実行はしない）
      expect(service.signup).toBeInstanceOf(Function)
      expect(service.login).toBeInstanceOf(Function)
      expect(service.logout).toBeInstanceOf(Function)
      expect(service.getCurrentUser).toBeInstanceOf(Function)
    })

    it('作成されたサービスが期待される依存性で構築されていることを確認', () => {
      // Arrange
      const client1 = mockDeep<RdbClient>()
      const client2 = mockDeep<RdbClient>()

      // Act
      const service1 = createActiveUserService(client1)
      const service2 = createActiveUserService(client2)

      // Assert - 異なるクライアントで作成されたサービスは独立している
      expect(service1).not.toBe(service2)
      expect(service1).toBeInstanceOf(ActiveUserService)
      expect(service2).toBeInstanceOf(ActiveUserService)

      // 内部的に異なる依存性を持つことで、異なるインスタンスが作成される
      expect(service1.constructor).toBe(ActiveUserService)
      expect(service2.constructor).toBe(ActiveUserService)
    })
  })

  describe('境界値・特殊値', () => {
    it.each(rdbClientTestCases)(
      '$nameで複数回呼び出すと毎回新しいインスタンスを作成する',
      ({ client }) => {
        // Act
        const service1 = createActiveUserService(client)
        const service2 = createActiveUserService(client)

        // Assert
        expect(service1).not.toBe(service2)
        expect(service1).toBeInstanceOf(ActiveUserService)
        expect(service2).toBeInstanceOf(ActiveUserService)
      },
    )

    it('異なる種類のRdbClientで作成したサービスインスタンスは互いに独立している', () => {
      // Arrange
      const mockPrismaClient = mockPrisma as unknown as RdbClient
      const mockDeepClient = mockDeep<RdbClient>()

      // Act
      const service1 = createActiveUserService(mockPrismaClient)
      const service2 = createActiveUserService(mockDeepClient)

      // Assert
      expect(service1).not.toBe(service2)
      expect(service1).toBeInstanceOf(ActiveUserService)
      expect(service2).toBeInstanceOf(ActiveUserService)
      // 異なるRdbClientでも同じ型のサービスインスタンスが作成される
    })

    it('同一のRdbClientインスタンスを再利用して複数のサービスを作成できる', () => {
      // Arrange
      const rdbClient = mockPrisma as unknown as RdbClient

      // Act
      const services = Array.from({ length: 3 }, () => createActiveUserService(rdbClient))

      // Assert
      services.forEach((service, index) => {
        expect(service).toBeInstanceOf(ActiveUserService)
        // 全て異なるインスタンス
        services.slice(index + 1).forEach((otherService) => {
          expect(service).not.toBe(otherService)
        })
      })
    })
  })

  describe('例外・制約違反', () => {
    const invalidRdbClients = [
      { name: 'null', value: null },
      { name: 'undefined', value: undefined },
      { name: '空オブジェクト', value: {} },
    ] as const

    it.each(invalidRdbClients)(
      '$nameのRdbClientを渡してもファクトリ関数はランタイムエラーを発生させない',
      ({ value }) => {
        // Note: TypeScriptの型システムでは本来無効な値は渡せないが、
        // ランタイムで予期しない値が渡された場合の堅牢性を確認

        // Act & Assert
        expect(() => createActiveUserService(value as any)).not.toThrow()
      },
    )

    it('無効なRdbClientで作成したサービスもActiveUserServiceインスタンスとして生成される', () => {
      // Arrange & Act
      const service = createActiveUserService(null as any)

      // Assert
      // ファクトリ自体はエラーを発生させない（メソッド実行時にエラーになる）
      expect(service).toBeInstanceOf(ActiveUserService)
      expect(service).toHaveProperty('signup')
      expect(service).toHaveProperty('login')
      expect(service).toHaveProperty('logout')
      expect(service).toHaveProperty('getCurrentUser')
    })

    it('型安全性違反時でもActiveUserServiceインスタンスとして認識される', () => {
      // Arrange & Act
      const service = createActiveUserService({} as any)

      // Assert
      expect(service).toBeInstanceOf(ActiveUserService)
      expect(service).toHaveProperty('signup')
      expect(service).toHaveProperty('login')
      expect(service).toHaveProperty('logout')
      expect(service).toHaveProperty('getCurrentUser')
    })

    it('プロトタイプ汚染攻撃に対する耐性を確認', () => {
      // Arrange
      const maliciousClient = Object.create(null)
      maliciousClient.__proto__ = { maliciousMethod: () => 'hacked' }

      // Act
      const service = createActiveUserService(maliciousClient as any)

      // Assert
      expect(service).toBeInstanceOf(ActiveUserService)
      expect(service).not.toHaveProperty('maliciousMethod')
    })
  })
})
