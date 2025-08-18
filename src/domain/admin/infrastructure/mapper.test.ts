import { describe, expect, it } from 'vitest'
import AdminUser from '../model/adminUser'
import { AdminUserRow, toDomainAdminUser, toUserListItem, UserWithAdminRow } from './mapper'

describe('Admin Mapper', () => {
  describe('toDomainAdminUser', () => {
    // テストデータ作成ヘルパー
    const createMockAdminUserRow = (overrides: Partial<AdminUserRow> = {}): AdminUserRow => {
      const now = new Date('2024-01-15T09:30:15.123Z')

      return {
        AdminUserId: 1,
        ActiveUserId: 123456789n,
        grantedAt: now,
        grantedByAdminUserId: 2,
        ...overrides,
      }
    }

    describe('基本動作', () => {
      it('標準的なAdminUserRowデータで全フィールドが正確にマッピングされること', () => {
        // Arrange
        const adminUserRow = createMockAdminUserRow()

        // Act
        const result = toDomainAdminUser(adminUserRow)

        // Assert
        expect(result).toBeInstanceOf(AdminUser)
        expect(result.adminUserId).toBe(adminUserRow.AdminUserId)
        expect(result.activeUserId).toBe(adminUserRow.ActiveUserId)
        expect(result.grantedAt).toEqual(adminUserRow.grantedAt)
        expect(result.grantedByAdminUserId).toBe(adminUserRow.grantedByAdminUserId)
      })

      it('結果オブジェクトがRowオブジェクトとは独立したAdminUserインスタンスであること', () => {
        // Arrange
        const adminUserRow = createMockAdminUserRow()

        // Act
        const result = toDomainAdminUser(adminUserRow)

        // Assert - インスタンス独立性の確認
        expect(result).not.toBe(adminUserRow)
        expect(result).toBeInstanceOf(AdminUser)

        // Dateオブジェクトは同じ参照を持つ（mapperの実装仕様）
        expect(result.grantedAt).toBe(adminUserRow.grantedAt)

        // プリミティブ値は値で比較される
        expect(result.adminUserId).toBe(adminUserRow.AdminUserId)
        expect(result.activeUserId).toBe(adminUserRow.ActiveUserId)
        expect(result.grantedByAdminUserId).toBe(adminUserRow.grantedByAdminUserId)
      })
    })

    describe('境界値・特殊値', () => {
      describe('数値型の境界値テスト', () => {
        // 数値型テストケースデータ
        const numericTestCases = [
          {
            name: 'adminUserIdの最小値(1)での境界値処理',
            adminUserId: 1,
            activeUserId: 1n,
            grantedByAdminUserId: 1,
            description: '正の整数の最小値での正確なマッピング',
          },
          {
            name: 'adminUserIdの通常値での処理',
            adminUserId: 999999,
            activeUserId: 123456789n,
            grantedByAdminUserId: 888888,
            description: '一般的な正の整数値での正確なマッピング',
          },
          {
            name: 'PostgreSQL integer最大値での処理',
            adminUserId: 2147483647, // PostgreSQL integerの最大値
            activeUserId: 9223372036854775806n, // PostgreSQL bigintの最大値に近い値
            grantedByAdminUserId: 2147483646,
            description: 'PostgreSQL integerの最大値での正確なマッピング',
          },
        ]

        numericTestCases.forEach(
          ({ name, adminUserId, activeUserId, grantedByAdminUserId, description }) => {
            it(`${name}`, () => {
              // Arrange
              const adminUserRow = createMockAdminUserRow({
                AdminUserId: adminUserId,
                ActiveUserId: activeUserId,
                grantedByAdminUserId,
              })

              // Act
              const result = toDomainAdminUser(adminUserRow)

              // Assert
              expect(result.adminUserId).toBe(adminUserId)
              expect(result.activeUserId).toBe(activeUserId)
              expect(result.grantedByAdminUserId).toBe(grantedByAdminUserId)
              expect(typeof result.adminUserId).toBe('number')
              expect(typeof result.activeUserId).toBe('bigint')
              expect(typeof result.grantedByAdminUserId).toBe('number')

              // 数値の正確性確認（文字列変換で比較）
              expect(result.activeUserId.toString()).toBe(activeUserId.toString())
            })
          },
        )
      })

      describe('bigint型の詳細境界値テスト', () => {
        // bigint値のテストケースデータ
        const bigintTestCases = [
          {
            name: '最小値(1)での境界値処理',
            activeUserId: 1n,
            description: 'bigintの最小値1での正確なマッピング',
          },
          {
            name: 'JavaScript Number.MAX_SAFE_INTEGER相当値での処理',
            activeUserId: 9007199254740991n, // Number.MAX_SAFE_INTEGER
            description: 'JavaScript Number型の安全な最大値での正確なマッピング',
          },
          {
            name: 'JavaScript Number.MAX_SAFE_INTEGER超過値での処理',
            activeUserId: 9007199254740992n, // Number.MAX_SAFE_INTEGER + 1
            description: 'JavaScript Number型の安全範囲を超えた値での正確なマッピング',
          },
          {
            name: '非常に大きなbigint値での処理',
            activeUserId: 123456789012345678901234567890n,
            description: 'PostgreSQL bigintの上限に近い非常に大きな値での正確なマッピング',
          },
        ]

        bigintTestCases.forEach(({ name, activeUserId, description }) => {
          it(`${name}`, () => {
            // Arrange
            const adminUserRow = createMockAdminUserRow({
              ActiveUserId: activeUserId,
            })

            // Act
            const result = toDomainAdminUser(adminUserRow)

            // Assert
            expect(result.activeUserId).toBe(activeUserId)
            expect(typeof result.activeUserId).toBe('bigint')

            // 数値の正確性確認（文字列変換で比較）
            expect(result.activeUserId.toString()).toBe(activeUserId.toString())
          })
        })
      })

      describe('Date型の特殊ケーステスト', () => {
        // Date型特殊ケーステストデータ
        const dateTestCases = [
          {
            name: 'Unix epoch(1970-01-01)での境界値処理',
            grantedAt: new Date('1970-01-01T00:00:00.000Z'),
            description: 'Unix epochタイムスタンプでの正確なマッピング',
          },
          {
            name: '1970年以前の日時での境界値処理',
            grantedAt: new Date('1969-12-31T23:59:59.999Z'),
            description: 'Unix epoch以前の日時での正確なマッピング',
          },
          {
            name: '遠い未来の日時での境界値処理',
            grantedAt: new Date('2099-12-31T23:59:59.999Z'),
            description: '遠い未来の日時での正確なマッピング',
          },
          {
            name: 'ミリ秒精度での境界値処理',
            grantedAt: new Date('2024-01-15T09:30:15.123Z'),
            description: 'ミリ秒精度の日時での正確なマッピング',
          },
          {
            name: 'タイムゾーンを含む日時での処理',
            grantedAt: new Date('2024-01-15T18:30:15+09:00'), // JST
            description: 'タイムゾーン付き日時での正確なマッピング',
          },
        ]

        dateTestCases.forEach(({ name, grantedAt, description }) => {
          it(`${name}`, () => {
            // Arrange
            const adminUserRow = createMockAdminUserRow({
              grantedAt,
            })

            // Act
            const result = toDomainAdminUser(adminUserRow)

            // Assert
            expect(result.grantedAt).toEqual(grantedAt)
            expect(result.grantedAt).toBeInstanceOf(Date)

            // Dateオブジェクトの参照共有（mapperの実装仕様）
            expect(result.grantedAt).toBe(grantedAt)

            // タイムスタンプ値の正確性確認
            expect(result.grantedAt.getTime()).toBe(grantedAt.getTime())
          })
        })
      })
    })

    describe('例外・制約違反', () => {
      describe('データ一貫性とマッピング精度テスト', () => {
        it('異なる数値のadminUserIdとgrantedByAdminUserIdが正確に区別されてマッピングされること', () => {
          // Arrange
          const adminUserId = 123
          const grantedByAdminUserId = 456
          const adminUserRow = createMockAdminUserRow({
            AdminUserId: adminUserId,
            grantedByAdminUserId,
          })

          // Act
          const result = toDomainAdminUser(adminUserRow)

          // Assert
          expect(result.adminUserId).toBe(adminUserId)
          expect(result.grantedByAdminUserId).toBe(grantedByAdminUserId)
          expect(result.adminUserId).not.toBe(result.grantedByAdminUserId)
        })

        it('極限値でのマッピング精度テスト', () => {
          // Arrange
          const nearMaxInt = 2147483646 // PostgreSQL integerの最大値に近い値
          const nearMaxBigInt = 9223372036854775806n // PostgreSQL bigintの最大値に近い値
          const adminUserRow = createMockAdminUserRow({
            AdminUserId: nearMaxInt,
            ActiveUserId: nearMaxBigInt,
            grantedByAdminUserId: nearMaxInt - 1,
          })

          // Act
          const result = toDomainAdminUser(adminUserRow)

          // Assert
          expect(result.adminUserId).toBe(nearMaxInt)
          expect(result.activeUserId).toBe(nearMaxBigInt)
          expect(result.grantedByAdminUserId).toBe(nearMaxInt - 1)
          expect(typeof result.adminUserId).toBe('number')
          expect(typeof result.activeUserId).toBe('bigint')
          expect(typeof result.grantedByAdminUserId).toBe('number')
          // 文字列変換での精度確認
          expect(result.activeUserId.toString()).toBe('9223372036854775806')
        })

        it('ミリ秒境界でのDate型マッピング精度テスト', () => {
          // Arrange
          const preciseDate = new Date('2024-01-15T09:30:15.999Z')
          const adminUserRow = createMockAdminUserRow({
            grantedAt: preciseDate,
          })

          // Act
          const result = toDomainAdminUser(adminUserRow)

          // Assert
          expect(result.grantedAt.getTime()).toBe(preciseDate.getTime())
          // ミリ秒レベルでの精度確認
          expect(result.grantedAt.getMilliseconds()).toBe(999)
        })
      })
    })
  })

  describe('toUserListItem', () => {
    // テストデータ作成ヘルパー
    const createMockUserWithAdminRow = (
      overrides: Partial<UserWithAdminRow> = {},
    ): UserWithAdminRow => {
      const now = new Date('2024-01-15T09:30:15.123Z')

      return {
        activeUserId: 123456789n,
        email: 'test@example.com',
        displayName: 'テストユーザー',
        createdAt: now,
        adminUser: {
          AdminUserId: 1,
          grantedAt: new Date('2024-01-10T10:00:00.000Z'),
          grantedByAdminUserId: 2,
        },
        ...overrides,
      }
    }

    describe('基本動作', () => {
      it('Admin権限を持つユーザーデータで全フィールドが正確にマッピングされること', () => {
        // Arrange
        const userWithAdminRow = createMockUserWithAdminRow()

        // Act
        const result = toUserListItem(userWithAdminRow)

        // Assert
        expect(result.activeUserId).toBe(userWithAdminRow.activeUserId)
        expect(result.email).toBe(userWithAdminRow.email)
        expect(result.displayName).toBe(userWithAdminRow.displayName)
        expect(result.isAdmin).toBe(true)
        expect(result.grantedAt).toEqual(userWithAdminRow.adminUser?.grantedAt)
        expect(result.grantedByAdminUserId).toBe(userWithAdminRow.adminUser?.grantedByAdminUserId)
        expect(result.createdAt).toEqual(userWithAdminRow.createdAt)
      })

      it('Admin権限を持たないユーザーデータで正確にマッピングされること', () => {
        // Arrange
        const userWithAdminRow = createMockUserWithAdminRow({
          adminUser: null,
        })

        // Act
        const result = toUserListItem(userWithAdminRow)

        // Assert
        expect(result.activeUserId).toBe(userWithAdminRow.activeUserId)
        expect(result.email).toBe(userWithAdminRow.email)
        expect(result.displayName).toBe(userWithAdminRow.displayName)
        expect(result.isAdmin).toBe(false)
        expect(result.grantedAt).toBeNull()
        expect(result.grantedByAdminUserId).toBeNull()
        expect(result.createdAt).toEqual(userWithAdminRow.createdAt)
      })

      it('displayNameがnullのユーザーでも正常に処理されること', () => {
        // Arrange
        const userWithAdminRow = createMockUserWithAdminRow({
          displayName: null,
          adminUser: null,
        })

        // Act
        const result = toUserListItem(userWithAdminRow)

        // Assert
        expect(result.displayName).toBeNull()
        expect(result.isAdmin).toBe(false)
        expect(result.grantedAt).toBeNull()
        expect(result.grantedByAdminUserId).toBeNull()
      })
    })

    describe('境界値・特殊値', () => {
      describe('bigint型の境界値テスト', () => {
        // bigint値のテストケースデータ
        const bigintTestCases = [
          {
            name: '最小値(1)での境界値処理',
            activeUserId: 1n,
            description: 'bigintの最小値1での正確なマッピング',
          },
          {
            name: 'JavaScript Number.MAX_SAFE_INTEGER相当値での処理',
            activeUserId: 9007199254740991n,
            description: 'JavaScript Number型の安全な最大値での正確なマッピング',
          },
          {
            name: '非常に大きなbigint値での処理',
            activeUserId: 123456789012345678901234567890n,
            description: 'PostgreSQL bigintの上限に近い非常に大きな値での正確なマッピング',
          },
        ]

        bigintTestCases.forEach(({ name, activeUserId, description }) => {
          it(`${name}`, () => {
            // Arrange
            const userWithAdminRow = createMockUserWithAdminRow({
              activeUserId,
              adminUser: null,
            })

            // Act
            const result = toUserListItem(userWithAdminRow)

            // Assert
            expect(result.activeUserId).toBe(activeUserId)
            expect(typeof result.activeUserId).toBe('bigint')
            expect(result.activeUserId.toString()).toBe(activeUserId.toString())
          })
        })
      })

      describe('文字列制約の境界値テスト', () => {
        // 文字列制約テストケースデータ
        const stringConstraintTestCases = [
          {
            name: '空文字列での境界値処理',
            email: '',
            displayName: '',
            description: '空文字列での正確なマッピング',
          },
          {
            name: 'email最大長での境界値処理',
            email: `${'a'.repeat(1011)}@example.com`, // 1024文字ちょうど
            displayName: '正常な表示名',
            description: 'emailがスキーマの最大長制限での正確なマッピング',
          },
          {
            name: 'displayName最大長での境界値処理',
            email: 'test@example.com',
            displayName: 'あ'.repeat(1024), // 日本語マルチバイト文字で1024文字
            description:
              'displayNameがスキーマの最大長制限（マルチバイト文字）での正確なマッピング',
          },
          {
            name: '現実的な日本語メールアドレスでの処理',
            email: '田中.太郎+test123@日本.example.co.jp',
            displayName: '田中太郎（営業部）',
            description: '国際化ドメイン名と日本語を含む実際的なデータでの正確なマッピング',
          },
        ]

        stringConstraintTestCases.forEach(({ name, email, displayName, description }) => {
          it(`${name}`, () => {
            // Arrange
            const userWithAdminRow = createMockUserWithAdminRow({
              email,
              displayName,
              adminUser: null,
            })

            // Act
            const result = toUserListItem(userWithAdminRow)

            // Assert
            expect(result.email).toBe(email)
            expect(result.displayName).toBe(displayName)

            // 文字列長制約の確認
            expect(result.email.length).toBeLessThanOrEqual(1024)
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
            grantedAt: new Date('1970-01-01T00:00:01.000Z'),
            description: 'Unix epochタイムスタンプでの正確なマッピング',
          },
          {
            name: '1970年以前の日時での境界値処理',
            createdAt: new Date('1969-12-31T23:59:59.999Z'),
            grantedAt: new Date('1969-07-20T20:17:00.000Z'),
            description: 'Unix epoch以前の日時での正確なマッピング',
          },
          {
            name: 'ミリ秒精度での境界値処理',
            createdAt: new Date('2024-01-15T09:30:15.123Z'),
            grantedAt: new Date('2024-01-15T09:30:15.456Z'),
            description: 'ミリ秒精度の異なる日時での正確なマッピング',
          },
        ]

        dateTestCases.forEach(({ name, createdAt, grantedAt, description }) => {
          it(`${name}`, () => {
            // Arrange
            const userWithAdminRow = createMockUserWithAdminRow({
              createdAt,
              adminUser: {
                AdminUserId: 1,
                grantedAt,
                grantedByAdminUserId: 2,
              },
            })

            // Act
            const result = toUserListItem(userWithAdminRow)

            // Assert
            expect(result.createdAt).toEqual(createdAt)
            expect(result.grantedAt).toEqual(grantedAt)
            expect(result.createdAt).toBeInstanceOf(Date)
            expect(result.grantedAt).toBeInstanceOf(Date)

            // タイムスタンプ値の正確性確認
            expect(result.createdAt.getTime()).toBe(createdAt.getTime())
            expect(result.grantedAt?.getTime()).toBe(grantedAt.getTime())
          })
        })
      })
    })

    describe('例外・制約違反', () => {
      describe('Admin権限フラグの正確性テスト', () => {
        it('adminUserがnullの場合isAdminがfalseになること', () => {
          // Arrange
          const userWithAdminRow = createMockUserWithAdminRow({
            adminUser: null,
          })

          // Act
          const result = toUserListItem(userWithAdminRow)

          // Assert
          expect(result.isAdmin).toBe(false)
          expect(result.grantedAt).toBeNull()
          expect(result.grantedByAdminUserId).toBeNull()
        })

        it('adminUserが存在する場合isAdminがtrueになること', () => {
          // Arrange
          const userWithAdminRow = createMockUserWithAdminRow({
            adminUser: {
              AdminUserId: 999,
              grantedAt: new Date(),
              grantedByAdminUserId: 888,
            },
          })

          // Act
          const result = toUserListItem(userWithAdminRow)

          // Assert
          expect(result.isAdmin).toBe(true)
          expect(result.grantedAt).not.toBeNull()
          expect(result.grantedByAdminUserId).not.toBeNull()
        })
      })

      describe('データ一貫性とマッピング精度テスト', () => {
        it('特殊文字を含むemailが正確にマッピングされること', () => {
          // Arrange
          const specialEmail = 'user+tag.test@sub-domain.example-site.co.jp'
          const userWithAdminRow = createMockUserWithAdminRow({
            email: specialEmail,
            adminUser: null,
          })

          // Act
          const result = toUserListItem(userWithAdminRow)

          // Assert
          expect(result.email).toBe(specialEmail)
          expect(result.email).toContain('+')
          expect(result.email).toContain('.')
          expect(result.email).toContain('-')
        })

        it('日本語・絵文字を含むdisplayNameが正確にマッピングされること', () => {
          // Arrange
          const unicodeDisplayName = '田中太郎🎌 (営業部)'
          const userWithAdminRow = createMockUserWithAdminRow({
            displayName: unicodeDisplayName,
            adminUser: null,
          })

          // Act
          const result = toUserListItem(userWithAdminRow)

          // Assert
          expect(result.displayName).toBe(unicodeDisplayName)
          expect(result.displayName).toContain('田中太郎')
          expect(result.displayName).toContain('🎌')
          expect(result.displayName).toContain('営業部')
          expect(result.displayName?.length).toBe(unicodeDisplayName.length)
        })

        it('極限値でのマッピング精度テスト', () => {
          // Arrange
          const nearMaxBigInt = 9223372036854775806n
          const nearMaxInt = 2147483647
          const userWithAdminRow = createMockUserWithAdminRow({
            activeUserId: nearMaxBigInt,
            adminUser: {
              AdminUserId: nearMaxInt,
              grantedAt: new Date(),
              grantedByAdminUserId: nearMaxInt - 1,
            },
          })

          // Act
          const result = toUserListItem(userWithAdminRow)

          // Assert
          expect(result.activeUserId).toBe(nearMaxBigInt)
          expect(result.grantedByAdminUserId).toBe(nearMaxInt - 1)
          expect(typeof result.activeUserId).toBe('bigint')
          expect(typeof result.grantedByAdminUserId).toBe('number')
          expect(result.activeUserId.toString()).toBe('9223372036854775806')
        })
      })
    })
  })
})
