import { faker } from '@faker-js/faker'
import { isError } from '@/common/types/utility'
import { createPrivacyPolicyUseCase } from '@/domain/policy'
import getRdbClient from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'
import activeUserTestHelper from './activeUserTestHelper'

process.env.NODE_ENV = 'test'

class PolicyTestHelper {
  private rdb = getRdbClient(TEST_ENV.DATABASE_URL)
  private useCase = createPrivacyPolicyUseCase(this.rdb)

  async cleanUp(): Promise<void> {
    // ポリシーテーブルをクリア
    await this.rdb.$queryRaw`TRUNCATE TABLE "privacy_policies" CASCADE;`
  }

  async createPolicy(content: string): Promise<{
    version: number
    effectiveAt: Date | null
    content: string
    createdAt: Date
    updatedAt: Date
  }> {
    const result = await this.useCase.createPolicy(content)
    if (isError(result)) {
      throw new Error(`Failed to create policy: ${result.error.message}`)
    }
    return {
      version: result.data.version,
      effectiveAt: result.data.effectiveAt,
      content: result.data.content,
      createdAt: result.data.createdAt,
      updatedAt: result.data.updatedAt,
    }
  }

  async activatePolicy(
    version: number,
    effectiveAt: Date,
  ): Promise<{
    version: number
    effectiveAt: Date | null
    content: string
    createdAt: Date
    updatedAt: Date
  }> {
    const result = await this.useCase.activatePolicy(version, effectiveAt)
    if (isError(result)) {
      throw new Error(`Failed to activate policy: ${result.error.message}`)
    }
    return {
      version: result.data.version,
      effectiveAt: result.data.effectiveAt,
      content: result.data.content,
      createdAt: result.data.createdAt,
      updatedAt: result.data.updatedAt,
    }
  }

  async deletePolicy(version: number): Promise<void> {
    const result = await this.useCase.deletePolicy(version)
    if (isError(result)) {
      throw new Error(`Failed to delete policy: ${result.error.message}`)
    }
  }

  async getPolicy(version: number): Promise<{
    version: number
    effectiveAt: Date | null
    content: string
    createdAt: Date
    updatedAt: Date
  } | null> {
    const result = await this.useCase.getPolicyByVersion(version)
    if (isError(result)) {
      // NotFoundErrorの場合はnullを返す（削除されたポリシーの確認に使用）
      if (result.error.message.includes('見つかりません')) {
        return null
      }
      throw new Error(`Failed to get policy: ${result.error.message}`)
    }
    if (!result.data) return null

    return {
      version: result.data.version,
      effectiveAt: result.data.effectiveAt,
      content: result.data.content,
      createdAt: result.data.createdAt,
      updatedAt: result.data.updatedAt,
    }
  }

  // 認証セッション準備
  async setupUserSession(): Promise<string> {
    const email = faker.internet.email()
    await activeUserTestHelper.create(email, 'password123', 'admin')
    const loginData = await activeUserTestHelper.login(email, 'password123')
    return loginData.sessionId
  }

  async disconnect(): Promise<void> {
    await this.rdb.$disconnect()
  }
}

const policyTestHelper = new PolicyTestHelper()
export default policyTestHelper
