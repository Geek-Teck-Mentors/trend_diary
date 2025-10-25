import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ClientError } from '@/common/errors'
import { isError, isSuccess, resultError, resultSuccess } from '@/common/types/utility'
import type { UserCommandRepository } from '@/domain/user/repository'
import type { AuthRepository } from './repository'
import { createAuthUseCase } from './useCase'

describe('AuthUseCase', () => {
  let authRepository: AuthRepository
  let userCommandRepository: UserCommandRepository

  beforeEach(() => {
    authRepository = {
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
    }
    userCommandRepository = {
      create: vi.fn(),
    }
  })

  describe('signUp', () => {
    it('Supabase Authでユーザーを作成し、Userテーブルにレコードを作成する', async () => {
      const email = 'test@example.com'
      const password = 'password123'
      const supabaseId = '123e4567-e89b-12d3-a456-426614174000'

      vi.mocked(authRepository.signUp).mockResolvedValue(resultSuccess({ id: supabaseId, email }))
      vi.mocked(userCommandRepository.create).mockResolvedValue(
        resultSuccess({ userId: 1n, supabaseId, createdAt: new Date() }),
      )

      const useCase = createAuthUseCase(authRepository, userCommandRepository)
      const result = await useCase.signUp(email, password)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.userId).toBe(1n)
        expect(result.data.supabaseId).toBe(supabaseId)
      }
      expect(authRepository.signUp).toHaveBeenCalledWith(email, password)
      expect(userCommandRepository.create).toHaveBeenCalledWith({ supabaseId })
    })

    it('Supabase Authでのユーザー作成が失敗した場合、エラーを返す', async () => {
      const email = 'test@example.com'
      const password = 'password123'
      const error = new ClientError('Email already registered')

      vi.mocked(authRepository.signUp).mockResolvedValue(resultError(error))

      const useCase = createAuthUseCase(authRepository, userCommandRepository)
      const result = await useCase.signUp(email, password)

      expect(isError(result)).toBe(true)
      if (isError(result)) {
        expect(result.error.message).toBe('Email already registered')
      }
      expect(userCommandRepository.create).not.toHaveBeenCalled()
    })

    it('Userテーブルへのレコード作成が失敗した場合、エラーを返す', async () => {
      const email = 'test@example.com'
      const password = 'password123'
      const supabaseId = '123e4567-e89b-12d3-a456-426614174000'
      const error = new ClientError('Database error')

      vi.mocked(authRepository.signUp).mockResolvedValue(resultSuccess({ id: supabaseId, email }))
      vi.mocked(userCommandRepository.create).mockResolvedValue(resultError(error))

      const useCase = createAuthUseCase(authRepository, userCommandRepository)
      const result = await useCase.signUp(email, password)

      expect(isError(result)).toBe(true)
      if (isError(result)) {
        expect(result.error.message).toBe('Database error')
      }
    })
  })

  describe('signIn', () => {
    it('Supabase Authでログインできる', async () => {
      const email = 'test@example.com'
      const password = 'password123'
      const supabaseId = '123e4567-e89b-12d3-a456-426614174000'

      vi.mocked(authRepository.signIn).mockResolvedValue(
        resultSuccess({
          accessToken: 'access123',
          refreshToken: 'refresh123',
          expiresAt: 1234567890,
          user: { id: supabaseId, email },
        }),
      )

      const useCase = createAuthUseCase(authRepository, userCommandRepository)
      const result = await useCase.signIn(email, password)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.accessToken).toBe('access123')
        expect(result.data.user.id).toBe(supabaseId)
      }
      expect(authRepository.signIn).toHaveBeenCalledWith(email, password)
    })

    it('認証エラー時はエラーを返す', async () => {
      const email = 'test@example.com'
      const password = 'wrong_password'
      const error = new ClientError('Invalid login credentials')

      vi.mocked(authRepository.signIn).mockResolvedValue(resultError(error))

      const useCase = createAuthUseCase(authRepository, userCommandRepository)
      const result = await useCase.signIn(email, password)

      expect(isError(result)).toBe(true)
      if (isError(result)) {
        expect(result.error.message).toBe('Invalid login credentials')
      }
    })
  })

  describe('signOut', () => {
    it('Supabase Authでログアウトできる', async () => {
      vi.mocked(authRepository.signOut).mockResolvedValue(resultSuccess(undefined))

      const useCase = createAuthUseCase(authRepository, userCommandRepository)
      const result = await useCase.signOut()

      expect(isSuccess(result)).toBe(true)
      expect(authRepository.signOut).toHaveBeenCalled()
    })

    it('エラー時はエラーを返す', async () => {
      const error = new ClientError('Logout failed')

      vi.mocked(authRepository.signOut).mockResolvedValue(resultError(error))

      const useCase = createAuthUseCase(authRepository, userCommandRepository)
      const result = await useCase.signOut()

      expect(isError(result)).toBe(true)
      if (isError(result)) {
        expect(result.error.message).toBe('Logout failed')
      }
    })
  })
})
