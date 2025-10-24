import { PrismaClient } from '@prisma/client'
import { isError } from '@/common/types/utility'
import { createAuthUseCase } from '@/domain/auth/useCase'
import { UserCommandRepositoryImpl } from '@/domain/user/infrastructure/commandImpl'
import { AuthRepositoryImpl } from '@/infrastructure/auth/authRepositoryImpl'
import { createAuthClient } from '@/infrastructure/auth/supabaseClient'
import getRdbClient from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'

process.env.NODE_ENV = 'test'

class AuthTestHelper {
  private rdb: PrismaClient
  private supabaseClient = createAuthClient(TEST_ENV.SUPABASE_URL, TEST_ENV.SUPABASE_ANON_KEY)

  constructor() {
    this.rdb = getRdbClient(TEST_ENV.DATABASE_URL) as PrismaClient
  }

  async cleanUp(): Promise<void> {
    // User関連テーブルをクリーンアップ
    try {
      await this.rdb.$queryRaw`TRUNCATE TABLE "users" CASCADE;`
    } catch (error) {
      if (error instanceof Error && error.message.includes('does not exist')) {
        return
      }
      throw error
    }
  }

  async create(email: string, password: string): Promise<{ userId: bigint; supabaseId: string }> {
    const authRepository = new AuthRepositoryImpl(this.supabaseClient)
    const userCommandRepository = new UserCommandRepositoryImpl(this.rdb)
    const useCase = createAuthUseCase(authRepository, userCommandRepository)

    const result = await useCase.signUp(email, password)
    if (isError(result)) {
      throw new Error(`Failed to create user: ${result.error.message}`)
    }

    return {
      userId: result.data.userId,
      supabaseId: result.data.supabaseId,
    }
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const authRepository = new AuthRepositoryImpl(this.supabaseClient)
    const userCommandRepository = new UserCommandRepositoryImpl(this.rdb)
    const useCase = createAuthUseCase(authRepository, userCommandRepository)

    const result = await useCase.signIn(email, password)
    if (isError(result)) {
      throw new Error(`Failed to login: ${result.error.message}`)
    }

    return {
      accessToken: result.data.accessToken,
      refreshToken: result.data.refreshToken,
    }
  }

  async disconnect(): Promise<void> {
    await this.rdb.$disconnect()
  }
}

const authTestHelper = new AuthTestHelper()
export default authTestHelper
