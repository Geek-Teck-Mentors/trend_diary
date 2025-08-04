import { isError } from '@/common/types/utility'
import { createPrivacyPolicyService } from '@/domain/policy'
import getRdbClient from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'
import activeUserTestHelper from './activeUserTestHelper'

process.env.NODE_ENV = 'test'

class PolicyTestHelper {
  private rdb = getRdbClient(TEST_ENV.DATABASE_URL)
  private service = createPrivacyPolicyService(this.rdb)

  async cleanUp(): Promise<void> {
    // ポリシーテーブルをクリア
    await this.rdb.$queryRaw`TRUNCATE TABLE "privacy_policies" CASCADE;`
  }

  async createPolicy(
    _sessionId: string,
    content = 'テストポリシー',
  ): Promise<{
    version: number
    effectiveAt: Date | null
    content: string
    createdAt: Date
    updatedAt: Date
  }> {
    const result = await this.service.createPolicy(content)
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

  async updatePolicy(
    version: number,
    content: string,
  ): Promise<{
    version: number
    effectiveAt: Date | null
    content: string
    createdAt: Date
    updatedAt: Date
  }> {
    const result = await this.service.updatePolicy(version, content)
    if (isError(result)) {
      throw new Error(`Failed to update policy: ${result.error.message}`)
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
    const result = await this.service.activatePolicy(version, effectiveAt)
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
    const result = await this.service.deletePolicy(version)
    if (isError(result)) {
      throw new Error(`Failed to delete policy: ${result.error.message}`)
    }
  }

  async clonePolicy(sourceVersion: number): Promise<{
    version: number
    effectiveAt: Date | null
    content: string
    createdAt: Date
    updatedAt: Date
  }> {
    const result = await this.service.clonePolicy(sourceVersion)
    if (isError(result)) {
      throw new Error(`Failed to clone policy: ${result.error.message}`)
    }
    return {
      version: result.data.version,
      effectiveAt: result.data.effectiveAt,
      content: result.data.content,
      createdAt: result.data.createdAt,
      updatedAt: result.data.updatedAt,
    }
  }

  async getPolicy(version: number): Promise<{
    version: number
    effectiveAt: Date | null
    content: string
    createdAt: Date
    updatedAt: Date
  } | null> {
    const result = await this.service.getPolicyByVersion(version)
    if (isError(result)) {
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

  async getPolicies(
    limit = 10,
    offset = 0,
  ): Promise<{
    policies: Array<{
      version: number
      effectiveAt: Date | null
      content: string
      createdAt: Date
      updatedAt: Date
    }>
    totalCount: number
  }> {
    const result = await this.service.getAllPolicies(limit, offset)
    if (isError(result)) {
      throw new Error(`Failed to get policies: ${result.error.message}`)
    }

    return {
      policies: result.data.policies.map((policy: any) => ({
        version: policy.version,
        effectiveAt: policy.effectiveAt,
        content: policy.content,
        createdAt: policy.createdAt,
        updatedAt: policy.updatedAt,
      })),
      totalCount: result.data.totalCount,
    }
  }

  // 認証セッション準備
  async setupUserSession(): Promise<string> {
    await activeUserTestHelper.create('admin@example.com', 'password123')
    const loginData = await activeUserTestHelper.login('admin@example.com', 'password123')
    return loginData.sessionId
  }

  async cleanUpAll(): Promise<void> {
    await this.cleanUp()
    await activeUserTestHelper.cleanUp()
  }

  async disconnect(): Promise<void> {
    await this.rdb.$disconnect()
  }
}

const policyTestHelper = new PolicyTestHelper()
export default policyTestHelper
