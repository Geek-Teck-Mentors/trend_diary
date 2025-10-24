import type { ClientError, ServerError } from '@/common/errors'
import { type AsyncResult, isSuccess } from '@/common/types/utility'
import type { UserCommandRepository } from '@/domain/user/repository'
import type { AuthRepository, AuthSession } from './repository'

type SignUpResult = {
  userId: bigint
  supabaseId: string
  createdAt: Date
}

export type AuthUseCase = {
  signUp(email: string, password: string): AsyncResult<SignUpResult, ClientError | ServerError>
  signIn(email: string, password: string): AsyncResult<AuthSession, ClientError | ServerError>
  signOut(): AsyncResult<void, ClientError | ServerError>
}

export function createAuthUseCase(
  authRepository: AuthRepository,
  userCommandRepository: UserCommandRepository,
): AuthUseCase {
  return {
    async signUp(email, password) {
      // 1. Supabase Authでユーザー作成
      const authResult = await authRepository.signUp(email, password)
      if (!isSuccess(authResult)) {
        return authResult
      }

      // 2. Userテーブルにレコード作成
      const userResult = await userCommandRepository.create({
        supabaseId: authResult.data.id,
      })
      if (!isSuccess(userResult)) {
        return userResult
      }

      return userResult
    },

    async signIn(email, password) {
      return await authRepository.signIn(email, password)
    },

    async signOut() {
      return await authRepository.signOut()
    },
  }
}
