import { ActiveUser as RdbActiveUser } from '@prisma/client'
import { describe, expect, it } from 'vitest'
import { mapToActiveUser } from './mapper'

describe('mapToActiveUser', () => {
  // テストデータ作成ヘルパー
  const createMockRdbActiveUser = (overrides: Partial<RdbActiveUser> = {}): RdbActiveUser => {
    // より現実的なデフォルトデータ
    const now = new Date('2024-01-15T09:30:00Z')
    const lastWeek = new Date('2024-01-08T14:22:15Z')

    return {
      activeUserId: 12345n,
      userId: 67890n,
      email: 'john.doe@example.com',
      password: '$2b$10$N9qo8uLOickgx2ZMRZoMye.sJkOIAg8VCLkDlV4EQOp7/Eo/qGJOm', // bcryptハッシュ例
      displayName: '田中太郎',
      authenticationId: null,
      lastLogin: lastWeek,
      createdAt: new Date('2023-11-20T10:15:30Z'),
      updatedAt: now,
      ...overrides,
    }
  }

  describe('基本動作', () => {
    it('標準的なActiveUserデータで全フィールドが正確にマッピングされること', () => {
      // Arrange
      const rdbActiveUser = createMockRdbActiveUser()

      // Act
      const result = mapToActiveUser(rdbActiveUser)

      // Assert
      expect(result).toBeDefined()
      expect(result.activeUserId).toBe(rdbActiveUser.activeUserId)
      expect(result.userId).toBe(rdbActiveUser.userId)
      expect(result.email).toBe(rdbActiveUser.email)
      expect(result.password).toBe(rdbActiveUser.password)
      expect(result.displayName).toBe(rdbActiveUser.displayName)
      expect(result.lastLogin).toEqual(rdbActiveUser.lastLogin)
      expect(result.createdAt).toEqual(rdbActiveUser.createdAt)
      expect(result.updatedAt).toEqual(rdbActiveUser.updatedAt)
    })

    it('最小限の必須フィールドのみでActiveUserインスタンスが正常生成されること', () => {
      // Arrange
      const rdbActiveUser = createMockRdbActiveUser({
        displayName: null,
        lastLogin: null,
      })

      // Act
      const result = mapToActiveUser(rdbActiveUser)

      // Assert
      expect(result).toBeDefined()
      expect(result.activeUserId).toBe(rdbActiveUser.activeUserId)
      expect(result.userId).toBe(rdbActiveUser.userId)
      expect(result.email).toBe(rdbActiveUser.email)
      expect(result.password).toBe(rdbActiveUser.password)
      expect(result.displayName).toBeNull()
      expect(result.lastLogin).toBeUndefined() // null -> undefined変換
      expect(result.createdAt).toEqual(rdbActiveUser.createdAt)
      expect(result.updatedAt).toEqual(rdbActiveUser.updatedAt)
    })

    it('結果オブジェクトがRDBオブジェクトとは独立したActiveUserインスタンスであること', () => {
      // Arrange
      const rdbActiveUser = createMockRdbActiveUser()

      // Act
      const result = mapToActiveUser(rdbActiveUser)

      // Assert - インスタンス独立性の確認
      expect(result).not.toBe(rdbActiveUser)
      expect(result).toBeDefined()

      // Dateオブジェクトは同じ参照を持つ（mapperの実装仕様）
      expect(result.createdAt).toBe(rdbActiveUser.createdAt)
      expect(result.updatedAt).toBe(rdbActiveUser.updatedAt)
      if (result.lastLogin && rdbActiveUser.lastLogin) {
        expect(result.lastLogin).toBe(rdbActiveUser.lastLogin)
      }

      // プリミティブ値は値で比較される
      expect(result.activeUserId).toBe(rdbActiveUser.activeUserId)
      expect(result.userId).toBe(rdbActiveUser.userId)
      expect(result.email).toBe(rdbActiveUser.email)
      expect(result.password).toBe(rdbActiveUser.password)
      expect(result.displayName).toBe(rdbActiveUser.displayName)
    })
  })

  describe('境界値・特殊値', () => {
    describe('bigint型の境界値テスト', () => {
      // bigint値のテストケースデータ
      const bigintTestCases = [
        {
          name: '最小値(0)での境界値処理',
          activeUserId: 0n,
          userId: 0n,
          description: 'bigintの最小値0での正確なマッピング',
        },
        {
          name: '通常の正の値での処理',
          activeUserId: 12345n,
          userId: 67890n,
          description: '一般的な正のbigint値での正確なマッピング',
        },
        {
          name: 'JavaScript Number.MAX_SAFE_INTEGER相当値での処理',
          activeUserId: 9007199254740991n, // Number.MAX_SAFE_INTEGER
          userId: 9007199254740990n,
          description: 'JavaScript Number型の安全な最大値での正確なマッピング',
        },
        {
          name: 'JavaScript Number.MAX_SAFE_INTEGER超過値での処理',
          activeUserId: 9007199254740992n, // Number.MAX_SAFE_INTEGER + 1
          userId: 18014398509481984n, // Number.MAX_SAFE_INTEGER * 2
          description: 'JavaScript Number型の安全範囲を超えた値での正確なマッピング',
        },
        {
          name: '非常に大きなbigint値での処理',
          activeUserId: 123456789012345678901234567890n,
          userId: 987654321098765432109876543210n,
          description: 'PostgreSQL bigintの上限に近い非常に大きな値での正確なマッピング',
        },
      ]

      bigintTestCases.forEach(({ name, activeUserId, userId, description }) => {
        it(`${name}`, () => {
          // Arrange
          const rdbActiveUser = createMockRdbActiveUser({
            activeUserId,
            userId,
            lastLogin: null,
          })

          // Act
          const result = mapToActiveUser(rdbActiveUser)

          // Assert
          expect(result.activeUserId).toBe(activeUserId)
          expect(result.userId).toBe(userId)
          expect(typeof result.activeUserId).toBe('bigint')
          expect(typeof result.userId).toBe('bigint')

          // 数値の正確性確認（文字列変換で比較）
          expect(result.activeUserId.toString()).toBe(activeUserId.toString())
          expect(result.userId.toString()).toBe(userId.toString())
        })
      })
    })

    describe('文字列制約の境界値テスト', () => {
      // 文字列制約テストケースデータ
      const stringConstraintTestCases = [
        {
          name: '空文字列での境界値処理',
          email: '',
          password: '',
          displayName: '',
          description: '空文字列での正確なマッピング（displayNameは空文字として保持）',
        },
        {
          name: 'email最大長(1024文字)での境界値処理',
          email: `${'a'.repeat(1011)}@example.com`, // 1011 + 13 = 1024文字ちょうど
          password: 'normalPassword',
          displayName: '正常な表示名',
          description: 'emailがPrismaスキーマの最大長制限での正確なマッピング',
        },
        {
          name: 'password最大長(1024文字)での境界値処理',
          email: 'test@example.com',
          password: `$2b$10$${'a'.repeat(1017)}`, // bcryptプレフィックス考慮して1024文字
          displayName: '正常な表示名',
          description: 'passwordがPrismaスキーマの最大長制限での正確なマッピング',
        },
        {
          name: 'displayName最大長(1024文字)での境界値処理',
          email: 'test@example.com',
          password: 'normalPassword',
          displayName: 'あ'.repeat(1024), // 日本語マルチバイト文字で1024文字
          description:
            'displayNameがPrismaスキーマの最大長制限（マルチバイト文字）での正確なマッピング',
        },
        {
          name: '現実的な日本語メールアドレスでの処理',
          email: '田中.太郎+test123@日本.example.co.jp',
          password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewUgMwU.lUhOazAO',
          displayName: '田中太郎（営業部）',
          description: '国際化ドメイン名と日本語を含む実際的なデータでの正確なマッピング',
        },
      ]

      stringConstraintTestCases.forEach(({ name, email, password, displayName, description }) => {
        it(`${name}`, () => {
          // Arrange
          const rdbActiveUser = createMockRdbActiveUser({
            email,
            password,
            displayName,
            lastLogin: null,
          })

          // Act
          const result = mapToActiveUser(rdbActiveUser)

          // Assert
          expect(result.email).toBe(email)
          expect(result.password).toBe(password)
          expect(result.displayName).toBe(displayName)

          // 文字列長制約の確認（1024文字以内）
          expect(result.email.length).toBeLessThanOrEqual(1024)
          expect(result.password.length).toBeLessThanOrEqual(1024)
          if (result.displayName) {
            expect(result.displayName.length).toBeLessThanOrEqual(1024)
          }
        })
      })
    })

    describe('Date型の特殊ケーステスト', () => {
      // Date型特殊ケーステストデータ
      const dateTestCases = [
        {
          name: 'Unix epoch(1970-01-01)での境界値処理',
          createdAt: new Date('1970-01-01T00:00:00.000Z'),
          updatedAt: new Date('1970-01-01T00:00:00.001Z'),
          lastLogin: new Date('1970-01-01T00:00:01.000Z'),
          description: 'Unix epochタイムスタンプでの正確なマッピング',
        },
        {
          name: '1970年以前の日時での境界値処理',
          createdAt: new Date('1969-12-31T23:59:59.999Z'),
          updatedAt: new Date('1969-07-20T20:17:00.000Z'), // 月面着陸日時
          lastLogin: new Date('1969-01-01T00:00:00.000Z'),
          description: 'Unix epoch以前の日時での正確なマッピング',
        },
        {
          name: '遠い未来の日時での境界値処理',
          createdAt: new Date('2099-12-31T23:59:59.999Z'),
          updatedAt: new Date('3000-01-01T00:00:00.000Z'),
          lastLogin: new Date('2500-06-15T12:30:45.123Z'),
          description: '遠い未来の日時での正確なマッピング',
        },
        {
          name: 'ミリ秒精度での境界値処理',
          createdAt: new Date('2024-01-15T09:30:15.123Z'),
          updatedAt: new Date('2024-01-15T09:30:15.999Z'),
          lastLogin: new Date('2024-01-15T09:30:15.000Z'),
          description: 'ミリ秒精度の異なる日時での正確なマッピング',
        },
        {
          name: 'タイムゾーンを含む日時での処理',
          createdAt: new Date('2024-01-15T18:30:15+09:00'), // JST
          updatedAt: new Date('2024-01-15T09:30:15Z'), // UTC（上記と同時刻）
          lastLogin: new Date('2024-01-15T01:30:15-08:00'), // PST（上記と同時刻）
          description: '異なるタイムゾーンだが同一時刻の日時での正確なマッピング',
        },
      ]

      dateTestCases.forEach(({ name, createdAt, updatedAt, lastLogin, description }) => {
        it(`${name}`, () => {
          // Arrange
          const rdbActiveUser = createMockRdbActiveUser({
            createdAt,
            updatedAt,
            lastLogin,
          })

          // Act
          const result = mapToActiveUser(rdbActiveUser)

          // Assert
          expect(result.createdAt).toEqual(createdAt)
          expect(result.updatedAt).toEqual(updatedAt)
          expect(result.lastLogin).toEqual(lastLogin)
          expect(result.createdAt).toBeInstanceOf(Date)
          expect(result.updatedAt).toBeInstanceOf(Date)
          expect(result.lastLogin).toBeInstanceOf(Date)

          // Dateオブジェクトの参照共有（mapperの実装仕様）
          expect(result.createdAt).toBe(createdAt)
          expect(result.updatedAt).toBe(updatedAt)
          expect(result.lastLogin).toBe(lastLogin)

          // タイムスタンプ値の正確性確認
          expect(result.createdAt.getTime()).toBe(createdAt.getTime())
          expect(result.updatedAt.getTime()).toBe(updatedAt.getTime())
          expect(result.lastLogin?.getTime()).toBe(lastLogin.getTime())
        })
      })
    })

    describe('null値の変換処理テスト', () => {
      it('lastLoginがnullの場合undefinedに正確に変換されること', () => {
        // Arrange
        const rdbActiveUser = createMockRdbActiveUser({
          lastLogin: null,
        })

        // Act
        const result = mapToActiveUser(rdbActiveUser)

        // Assert
        expect(result.lastLogin).toBeUndefined()
        expect(result.lastLogin).not.toBeNull()
      })

      it('displayNameがnullの場合nullのまま保持されること', () => {
        // Arrange
        const rdbActiveUser = createMockRdbActiveUser({
          displayName: null,
          lastLogin: null,
        })

        // Act
        const result = mapToActiveUser(rdbActiveUser)

        // Assert
        expect(result.displayName).toBeNull()
        expect(result.displayName).not.toBeUndefined()
      })

      it('displayNameが空文字列の場合そのまま保持されること', () => {
        // Arrange
        const rdbActiveUser = createMockRdbActiveUser({
          displayName: '',
          lastLogin: null,
        })

        // Act
        const result = mapToActiveUser(rdbActiveUser)

        // Assert
        expect(result.displayName).toBe('')
        expect(result.displayName).not.toBeNull()
        expect(result.displayName).not.toBeUndefined()
      })
    })
  })

  describe('例外・制約違反', () => {
    describe('データ一貫性とマッピング精度テスト', () => {
      it('同一タイムスタンプでのcreatedAtとupdatedAtが正確にマッピングされること', () => {
        // Arrange
        const timestamp = '2024-01-15T09:30:15.123Z'
        const createdAt = new Date(timestamp)
        const updatedAt = new Date(timestamp) // 異なるインスタンスだが同じ時刻
        const rdbActiveUser = createMockRdbActiveUser({
          createdAt,
          updatedAt,
          lastLogin: null,
        })

        // Act
        const result = mapToActiveUser(rdbActiveUser)

        // Assert
        expect(result.createdAt).toEqual(createdAt)
        expect(result.updatedAt).toEqual(updatedAt)
        expect(result.createdAt.getTime()).toBe(result.updatedAt.getTime())
        // 元の異なるインスタンスがマッピング後も異なる参照であることを確認
        expect(result.createdAt).not.toBe(result.updatedAt)
        expect(result.createdAt).toBe(createdAt) // 元の参照を保持
        expect(result.updatedAt).toBe(updatedAt) // 元の参照を保持
      })

      it('異なるbigint値のactiveUserIdとuserIdが正確に区別されてマッピングされること', () => {
        // Arrange
        const activeUserId = 123456789n
        const userId = 987654321n
        const rdbActiveUser = createMockRdbActiveUser({
          activeUserId,
          userId,
          lastLogin: null,
        })

        // Act
        const result = mapToActiveUser(rdbActiveUser)

        // Assert
        expect(result.activeUserId).toBe(activeUserId)
        expect(result.userId).toBe(userId)
        expect(result.activeUserId).not.toBe(result.userId)
        expect(result.activeUserId.toString()).toBe('123456789')
        expect(result.userId.toString()).toBe('987654321')
      })

      it('特殊文字を含むemailとpasswordが正確にマッピングされること', () => {
        // Arrange
        const specialEmail = 'user+tag.test@sub-domain.example-site.co.jp'
        const specialPassword = '$2b$12$abcd.EFGH/ijkl+mnop=qrst123456789'
        const rdbActiveUser = createMockRdbActiveUser({
          email: specialEmail,
          password: specialPassword,
          displayName: null,
          lastLogin: null,
        })

        // Act
        const result = mapToActiveUser(rdbActiveUser)

        // Assert
        expect(result.email).toBe(specialEmail)
        expect(result.password).toBe(specialPassword)
        // 特殊文字が保持されることを確認
        expect(result.email).toContain('+')
        expect(result.email).toContain('.')
        expect(result.email).toContain('-')
        expect(result.password).toContain('$')
        expect(result.password).toContain('/')
        expect(result.password).toContain('+')
        expect(result.password).toContain('=')
      })

      it('日本語・絵文字を含むdisplayNameが正確にマッピングされること', () => {
        // Arrange
        const unicodeDisplayName = '田中太郎🎌 (営業部)'
        const rdbActiveUser = createMockRdbActiveUser({
          displayName: unicodeDisplayName,
          lastLogin: null,
        })

        // Act
        const result = mapToActiveUser(rdbActiveUser)

        // Assert
        expect(result.displayName).toBe(unicodeDisplayName)
        expect(result.displayName).toContain('田中太郎')
        expect(result.displayName).toContain('🎌')
        expect(result.displayName).toContain('営業部')
        // Unicode文字列長の確認
        expect(result.displayName?.length).toBe(unicodeDisplayName.length)
      })
    })

    describe('極限値でのマッピング安定性テスト', () => {
      it('PostgreSQL bigint上限に近い値でのマッピング精度テスト', () => {
        // Arrange
        // PostgreSQL bigintの最大値は 9223372036854775807
        const nearMaxBigInt = 9223372036854775806n
        const rdbActiveUser = createMockRdbActiveUser({
          activeUserId: nearMaxBigInt,
          userId: nearMaxBigInt - 1n,
          lastLogin: null,
        })

        // Act
        const result = mapToActiveUser(rdbActiveUser)

        // Assert
        expect(result.activeUserId).toBe(nearMaxBigInt)
        expect(result.userId).toBe(nearMaxBigInt - 1n)
        expect(typeof result.activeUserId).toBe('bigint')
        expect(typeof result.userId).toBe('bigint')
        // 文字列変換での精度確認
        expect(result.activeUserId.toString()).toBe('9223372036854775806')
        expect(result.userId.toString()).toBe('9223372036854775805')
      })

      it('ミリ秒境界でのDate型マッピング精度テスト', () => {
        // Arrange
        const preciseDate1 = new Date('2024-01-15T09:30:15.000Z')
        const preciseDate2 = new Date('2024-01-15T09:30:15.001Z')
        const preciseDate3 = new Date('2024-01-15T09:30:15.999Z')

        const rdbActiveUser = createMockRdbActiveUser({
          createdAt: preciseDate1,
          updatedAt: preciseDate2,
          lastLogin: preciseDate3,
        })

        // Act
        const result = mapToActiveUser(rdbActiveUser)

        // Assert
        expect(result.createdAt.getTime()).toBe(preciseDate1.getTime())
        expect(result.updatedAt.getTime()).toBe(preciseDate2.getTime())
        expect(result.lastLogin?.getTime()).toBe(preciseDate3.getTime())

        // ミリ秒レベルでの精度確認
        expect(result.createdAt.getMilliseconds()).toBe(0)
        expect(result.updatedAt.getMilliseconds()).toBe(1)
        expect(result.lastLogin?.getMilliseconds()).toBe(999)
      })
    })
  })
})
