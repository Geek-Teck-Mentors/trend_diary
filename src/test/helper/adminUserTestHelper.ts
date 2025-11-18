import { isFailure } from '@yuukihayashi0510/core'
import { createAdminUserUseCase } from '@/domain/admin'
import getRdbClient from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'
import activeUserTestHelper from './activeUserTestHelper'

process.env.NODE_ENV = 'test'

class AdminUserTestHelper {
  private rdb = getRdbClient(TEST_ENV.DATABASE_URL)

  private useCase = createAdminUserUseCase(this.rdb)

  async cleanUp(): Promise<void> {
    // UserRole関連テーブルをクリーンアップ（テーブルが存在する場合のみ）
    try {
      await this.rdb.$queryRaw`TRUNCATE TABLE "user_roles" CASCADE;`
    } catch (error) {
      // テーブルが存在しない場合は無視（テスト環境の初期状態）
      if (error instanceof Error && error.message.includes('does not exist')) {
        return
      }
      throw error
    }
  }

  async createAdminUser(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<{ activeUserId: bigint; adminUserId: number; sessionId: string }> {
    // 通常ユーザーを作成
    const userInfo = await activeUserTestHelper.create(email, password, displayName)

    // Admin権限を付与（UserRoleに管理者ロールを追加）
    // grantedByActiveUserIdは自分自身（テストデータのため）
    const adminResult = await this.useCase.grantAdminRole(
      userInfo.activeUserId,
      userInfo.activeUserId,
    )
    if (isFailure(adminResult)) {
      throw new Error(`Failed to grant admin role: ${adminResult.error.message}`)
    }

    // ログインしてセッションIDを取得
    const loginInfo = await activeUserTestHelper.login(email, password)

    return {
      activeUserId: userInfo.activeUserId,
      adminUserId: adminResult.data.adminUserId,
      sessionId: loginInfo.sessionId,
    }
  }

  async createRegularUser(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<{ activeUserId: bigint; sessionId: string }> {
    // 通常ユーザーを作成（Admin権限は付与しない）
    const userInfo = await activeUserTestHelper.create(email, password, displayName)

    // 権限システムのロールを割り当て（「一般ユーザー」ロール）
    // シードデータで作成された「一般ユーザー」ロールを取得して割り当て
    const regularRole = await this.rdb.role.findFirst({
      where: { displayName: '一般ユーザー' },
    })
    if (regularRole) {
      await this.rdb.userRole.create({
        data: {
          activeUserId: userInfo.activeUserId,
          roleId: regularRole.roleId,
        },
      })
    }

    const loginInfo = await activeUserTestHelper.login(email, password)

    return {
      activeUserId: userInfo.activeUserId,
      sessionId: loginInfo.sessionId,
    }
  }

  async grantAdminRole(
    activeUserId: bigint,
    grantedByActiveUserId: bigint,
  ): Promise<{ adminUserId: number }> {
    const result = await this.useCase.grantAdminRole(activeUserId, grantedByActiveUserId)
    if (isFailure(result)) {
      throw new Error(`Failed to grant admin role: ${result.error.message}`)
    }
    return {
      adminUserId: result.data.adminUserId,
    }
  }

  async getUserList(query?: { searchQuery?: string; page?: number; limit?: number }): Promise<{
    users: Array<{
      activeUserId: bigint
      email: string
      displayName: string | null
      hasAdminAccess: boolean
      grantedAt: Date | null
      grantedByAdminUserId: number | null
      createdAt: Date
    }>
    total: number
  }> {
    const result = await this.useCase.getUserList(query)
    if (isFailure(result)) {
      throw new Error(`Failed to get user list: ${result.error.message}`)
    }
    return result.data
  }

  getRdb() {
    return this.rdb
  }

  async disconnect(): Promise<void> {
    await this.rdb.$disconnect()
  }
}

const adminUserTestHelper = new AdminUserTestHelper()
export default adminUserTestHelper
