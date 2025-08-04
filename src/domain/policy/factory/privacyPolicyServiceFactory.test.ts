import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { RdbClient } from '@/infrastructure/rdb'
import mockPrisma from '@/test/__mocks__/prisma'
import PrivacyPolicyService from '../service/privacyPolicyService'
import createPrivacyPolicyService from './privacyPolicyServiceFactory'

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

describe('createPrivacyPolicyService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本動作', () => {
    it('プロジェクト標準のmockPrismaでPrivacyPolicyServiceインスタンスを正常に作成する', () => {
      // Act
      const service = createPrivacyPolicyService(mockPrisma as unknown as RdbClient)

      // Assert
      expect(service).toBeInstanceOf(PrivacyPolicyService)
      expect(service).toBeDefined()
    })

    it.each(rdbClientTestCases)(
      '$nameで正しい型のPrivacyPolicyServiceインスタンスを返す',
      ({ client }) => {
        // Act
        const service = createPrivacyPolicyService(client)

        // Assert
        expect(service).toBeInstanceOf(PrivacyPolicyService)
        expect(service).toHaveProperty('getAllPolicies')
        expect(service).toHaveProperty('getPolicyByVersion')
        expect(service).toHaveProperty('createPolicy')
        expect(service).toHaveProperty('updatePolicy')
        expect(service).toHaveProperty('deletePolicy')
        expect(service).toHaveProperty('clonePolicy')
        expect(service).toHaveProperty('activatePolicy')

        // 型安全性の検証 - 正確な関数型を持つことを確認
        expect(typeof service.getAllPolicies).toBe('function')
        expect(typeof service.getPolicyByVersion).toBe('function')
        expect(typeof service.createPolicy).toBe('function')
        expect(typeof service.updatePolicy).toBe('function')
        expect(typeof service.deletePolicy).toBe('function')
        expect(typeof service.clonePolicy).toBe('function')
        expect(typeof service.activatePolicy).toBe('function')
      },
    )

    it('作成されたサービスのメソッドが関数として正しく定義されている', () => {
      // Act
      const service = createPrivacyPolicyService(mockPrisma as unknown as RdbClient)

      // Assert - 各メソッドが関数として存在することを確認
      expect(typeof service.getAllPolicies).toBe('function')
      expect(typeof service.getPolicyByVersion).toBe('function')
      expect(typeof service.createPolicy).toBe('function')
      expect(typeof service.updatePolicy).toBe('function')
      expect(typeof service.deletePolicy).toBe('function')
      expect(typeof service.clonePolicy).toBe('function')
      expect(typeof service.activatePolicy).toBe('function')

      // メソッドが呼び出し可能であることを確認（実行はしない）
      expect(service.getAllPolicies).toBeInstanceOf(Function)
      expect(service.getPolicyByVersion).toBeInstanceOf(Function)
      expect(service.createPolicy).toBeInstanceOf(Function)
      expect(service.updatePolicy).toBeInstanceOf(Function)
      expect(service.deletePolicy).toBeInstanceOf(Function)
      expect(service.clonePolicy).toBeInstanceOf(Function)
      expect(service.activatePolicy).toBeInstanceOf(Function)
    })

    it('作成されたサービスが期待される依存性で構築されていることを確認', () => {
      // Arrange
      const client1 = mockDeep<RdbClient>()
      const client2 = mockDeep<RdbClient>()

      // Act
      const service1 = createPrivacyPolicyService(client1)
      const service2 = createPrivacyPolicyService(client2)

      // Assert - 異なるクライアントで作成されたサービスは独立している
      expect(service1).not.toBe(service2)
      expect(service1).toBeInstanceOf(PrivacyPolicyService)
      expect(service2).toBeInstanceOf(PrivacyPolicyService)

      // 内部的に異なる依存性を持つことで、異なるインスタンスが作成される
      expect(service1.constructor).toBe(PrivacyPolicyService)
      expect(service2.constructor).toBe(PrivacyPolicyService)
    })
  })

  describe('境界値・特殊値', () => {
    it.each(rdbClientTestCases)(
      '$nameで複数回呼び出すと毎回新しいインスタンスを作成する',
      ({ client }) => {
        // Act
        const service1 = createPrivacyPolicyService(client)
        const service2 = createPrivacyPolicyService(client)

        // Assert
        expect(service1).not.toBe(service2)
        expect(service1).toBeInstanceOf(PrivacyPolicyService)
        expect(service2).toBeInstanceOf(PrivacyPolicyService)
      },
    )

    it('異なる種類のRdbClientで作成したサービスインスタンスは互いに独立している', () => {
      // Arrange
      const mockPrismaClient = mockPrisma as unknown as RdbClient
      const mockDeepClient = mockDeep<RdbClient>()

      // Act
      const service1 = createPrivacyPolicyService(mockPrismaClient)
      const service2 = createPrivacyPolicyService(mockDeepClient)

      // Assert
      expect(service1).not.toBe(service2)
      expect(service1).toBeInstanceOf(PrivacyPolicyService)
      expect(service2).toBeInstanceOf(PrivacyPolicyService)
      // 異なるRdbClientでも同じ型のサービスインスタンスが作成される
    })

    it('同一のRdbClientインスタンスを再利用して複数のサービスを作成できる', () => {
      // Arrange
      const rdbClient = mockPrisma as unknown as RdbClient

      // Act
      const services = Array.from({ length: 3 }, () => createPrivacyPolicyService(rdbClient))

      // Assert
      services.forEach((service, index) => {
        expect(service).toBeInstanceOf(PrivacyPolicyService)
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
        expect(() => createPrivacyPolicyService(value as any)).not.toThrow()
      },
    )

    it('無効なRdbClientで作成したサービスもPrivacyPolicyServiceインスタンスとして生成される', () => {
      // Arrange & Act
      const service = createPrivacyPolicyService(null as any)

      // Assert
      // ファクトリ自体はエラーを発生させない（メソッド実行時にエラーになる）
      expect(service).toBeInstanceOf(PrivacyPolicyService)
      expect(service).toHaveProperty('getAllPolicies')
      expect(service).toHaveProperty('getPolicyByVersion')
      expect(service).toHaveProperty('createPolicy')
      expect(service).toHaveProperty('updatePolicy')
      expect(service).toHaveProperty('deletePolicy')
      expect(service).toHaveProperty('clonePolicy')
      expect(service).toHaveProperty('activatePolicy')
    })

    it('型安全性違反時でもPrivacyPolicyServiceインスタンスとして認識される', () => {
      // Arrange & Act
      const service = createPrivacyPolicyService({} as any)

      // Assert
      expect(service).toBeInstanceOf(PrivacyPolicyService)
      expect(service).toHaveProperty('getAllPolicies')
      expect(service).toHaveProperty('getPolicyByVersion')
      expect(service).toHaveProperty('createPolicy')
      expect(service).toHaveProperty('updatePolicy')
      expect(service).toHaveProperty('deletePolicy')
      expect(service).toHaveProperty('clonePolicy')
      expect(service).toHaveProperty('activatePolicy')
    })

    it('プロトタイプ汚染攻撃に対する耐性を確認', () => {
      // Arrange
      const maliciousClient = Object.create(null)
      maliciousClient.__proto__ = { maliciousMethod: () => 'hacked' }

      // Act
      const service = createPrivacyPolicyService(maliciousClient as any)

      // Assert
      expect(service).toBeInstanceOf(PrivacyPolicyService)
      expect(service).not.toHaveProperty('maliciousMethod')
    })
  })
})
