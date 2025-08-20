import { isError } from '@/common/types/utility'
import { createAdminUserUseCase } from '@/domain/admin'
import getRdbClient from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'
import activeUserTestHelper from './activeUserTestHelper'

process.env.NODE_ENV = 'test'

class AdminUserTestHelper {
  private rdb = getRdbClient(TEST_ENV.DATABASE_URL)

  private useCase = createAdminUserUseCase(this.rdb)

  async cleanUp(): Promise<void> {
    // AdminUser関連テーブルをクリーンアップ（テーブルが存在する場合のみ）
    try {
      await this.rdb.$queryRaw`TRUNCATE TABLE "admin_users" CASCADE;`
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

    // Admin権限を付与
    const adminResult = await this.useCase.grantAdminRole(userInfo.activeUserId, 1)
    if (isError(adminResult)) {
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
    const loginInfo = await activeUserTestHelper.login(email, password)

    return {
      activeUserId: userInfo.activeUserId,
      sessionId: loginInfo.sessionId,
    }
  }

  async grantAdminRole(
    activeUserId: bigint,
    grantedByAdminUserId: number,
  ): Promise<{ adminUserId: number }> {
    const result = await this.useCase.grantAdminRole(activeUserId, grantedByAdminUserId)
    if (isError(result)) {
      throw new Error(`Failed to grant admin role: ${result.error.message}`)
    }
    return {
      adminUserId: result.data.adminUserId,
    }
  }

  async isAdmin(activeUserId: bigint): Promise<boolean> {
    const result = await this.useCase.isAdmin(activeUserId)
    if (isError(result)) {
      throw new Error(`Failed to check admin status: ${result.error.message}`)
    }
    return result.data
  }

  async getUserList(query?: { searchQuery?: string; page?: number; limit?: number }): Promise<{
    users: Array<{
      activeUserId: bigint
      email: string
      displayName: string | null
      isAdmin: boolean
      grantedAt: Date | null
      grantedByAdminUserId: number | null
      createdAt: Date
    }>
    total: number
  }> {
    const result = await this.useCase.getUserList(query)
    if (isError(result)) {
      throw new Error(`Failed to get user list: ${result.error.message}`)
    }
    return result.data
  }

  async disconnect(): Promise<void> {
    await this.rdb.$disconnect()
  }
}

const adminUserTestHelper = new AdminUserTestHelper()
export default adminUserTestHelper
