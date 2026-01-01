import { type AsyncResult, failure, success } from '@yuukihayashi0510/core'
import * as bcrypt from 'bcryptjs'
import { AlreadyExistsError, ClientError, ServerError } from '@/common/errors'
import UnauthorizedError from '@/common/errors/unauthorizedError'
import type {
  AuthV2LoginResult,
  AuthV2Repository,
  AuthV2SignupResult,
} from '@/domain/user/repository'
import type { AuthenticationUser } from '@/domain/user/schema/auth-schema'

const BCRYPT_SALT_ROUNDS = 10

type MockUser = {
  id: string
  email: string
  passwordHash: string
  emailConfirmedAt: Date | null
  createdAt: Date
}

export class MockAuthV2Repository implements AuthV2Repository {
  private users: Map<string, MockUser> = new Map()
  private currentUserId: string | null = null
  private userIdCounter = 1

  async signup(
    email: string,
    password: string,
  ): AsyncResult<AuthV2SignupResult, ClientError | ServerError> {
    // メールアドレスの重複チェック
    const existingUser = Array.from(this.users.values()).find((u) => u.email === email)
    if (existingUser) {
      return failure(new AlreadyExistsError('User already exists'))
    }

    const userId = `mock-user-${this.userIdCounter++}`
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
    const now = new Date()

    const mockUser: MockUser = {
      id: userId,
      email,
      passwordHash,
      emailConfirmedAt: now, // モックではすぐに確認済みにする
      createdAt: now,
    }

    this.users.set(userId, mockUser)
    this.currentUserId = userId

    const user: AuthenticationUser = {
      id: mockUser.id,
      email: mockUser.email,
      emailConfirmedAt: mockUser.emailConfirmedAt,
      createdAt: mockUser.createdAt,
    }

    return success({
      user,
      session: {
        accessToken: `mock-access-token-${userId}`,
        refreshToken: `mock-refresh-token-${userId}`,
        expiresIn: 3600,
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
        user,
      },
    })
  }

  async login(
    email: string,
    password: string,
  ): AsyncResult<AuthV2LoginResult, ClientError | ServerError> {
    const mockUser = Array.from(this.users.values()).find((u) => u.email === email)

    if (!mockUser) {
      return failure(new ClientError('Invalid email or password', 401))
    }

    const isValid = await bcrypt.compare(password, mockUser.passwordHash)
    if (!isValid) {
      return failure(new ClientError('Invalid email or password', 401))
    }

    this.currentUserId = mockUser.id

    const user: AuthenticationUser = {
      id: mockUser.id,
      email: mockUser.email,
      emailConfirmedAt: mockUser.emailConfirmedAt,
      createdAt: mockUser.createdAt,
    }

    return success({
      user,
      session: {
        accessToken: `mock-access-token-${mockUser.id}`,
        refreshToken: `mock-refresh-token-${mockUser.id}`,
        expiresIn: 3600,
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
        user,
      },
    })
  }

  async logout(): AsyncResult<void, ServerError> {
    this.currentUserId = null
    return success(undefined)
  }

  async getCurrentUser(): AsyncResult<AuthenticationUser, ServerError> {
    if (!this.currentUserId) {
      return failure(
        new UnauthorizedError('session not found', {
          sessionExists: false,
        }),
      )
    }

    const mockUser = this.users.get(this.currentUserId)
    if (!mockUser) {
      return failure(
        new UnauthorizedError('session not found', {
          sessionExists: true,
        }),
      )
    }

    const user: AuthenticationUser = {
      id: mockUser.id,
      email: mockUser.email,
      emailConfirmedAt: mockUser.emailConfirmedAt,
      createdAt: mockUser.createdAt,
    }

    return success(user)
  }

  async refreshSession(): AsyncResult<AuthV2LoginResult, ServerError> {
    if (!this.currentUserId) {
      return failure(new ServerError('No active session'))
    }

    const mockUser = this.users.get(this.currentUserId)
    if (!mockUser) {
      return failure(new ServerError('User not found'))
    }

    const user: AuthenticationUser = {
      id: mockUser.id,
      email: mockUser.email,
      emailConfirmedAt: mockUser.emailConfirmedAt,
      createdAt: mockUser.createdAt,
    }

    return success({
      user,
      session: {
        accessToken: `mock-access-token-${mockUser.id}`,
        refreshToken: `mock-refresh-token-${mockUser.id}`,
        expiresIn: 3600,
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
        user,
      },
    })
  }

  async deleteUser(userId: string): AsyncResult<void, ServerError> {
    if (!this.users.has(userId)) {
      return failure(new ServerError('User not found'))
    }

    this.users.delete(userId)
    if (this.currentUserId === userId) {
      this.currentUserId = null
    }

    return success(undefined)
  }

  // テスト用ヘルパーメソッド
  clearAll() {
    this.users.clear()
    this.currentUserId = null
    this.userIdCounter = 1
  }
}
