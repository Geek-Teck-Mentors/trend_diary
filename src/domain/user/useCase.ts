import { AsyncResult, failure, isFailure, Result, success } from '@yuukihayashi0510/core'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { SESSION_DURATION } from '@/common/constants'
import { AlreadyExistsError, ClientError, NotFoundError, ServerError } from '@/common/errors'
import { isNull, Nullable } from '@/common/types/utility'
import { Command, Query } from './repository'
import type { ActiveUser, ActiveUserWithoutPassword, CurrentUser } from './schema/activeUserSchema'
import { recordLogin } from './schema/method'

type LoginResult = {
  activeUser: ActiveUserWithoutPassword
  sessionId: string
  expiresAt: Date
}

export class UseCase {
  constructor(
    private query: Query,
    private command: Command,
  ) {}

  async signup(
    email: string,
    plainPassword: string,
  ): Promise<Result<ActiveUserWithoutPassword, Error>> {
    const existingResult = await this.query.findActiveByEmail(email)
    if (isFailure(existingResult)) return existingResult
    if (!isNull(existingResult.data)) {
      return failure(new AlreadyExistsError('Email already exists'))
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10)

    const activeUserResult = await this.command.createActive(email, hashedPassword)
    if (isFailure(activeUserResult)) {
      return failure(ServerError.handle(activeUserResult.error))
    }

    return success(activeUserResult.data)
  }

  async login(
    email: string,
    plainPassword: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Result<LoginResult, Error>> {
    const authResult = await this.authenticateUser(email, plainPassword)
    if (isFailure(authResult)) return failure(authResult.error)

    const sessionResult = await this.createLoginSession(
      authResult.data.activeUserId,
      ipAddress,
      userAgent,
    )
    if (isFailure(sessionResult)) return failure(sessionResult.error)

    const { sessionId, expiresAt } = sessionResult.data

    const updatedUser = recordLogin(authResult.data)
    const updateResult = await this.command.saveActive(updatedUser)
    if (isFailure(updateResult)) return failure(updateResult.error)

    return success({
      activeUser: updateResult.data,
      sessionId,
      expiresAt,
    })
  }

  private async authenticateUser(
    email: string,
    plainPassword: string,
  ): Promise<Result<ActiveUser, Error>> {
    const activeUserResult = await this.query.findActiveByEmailForAuth(email)
    if (isFailure(activeUserResult)) return failure(ServerError.handle(activeUserResult.error))
    if (isNull(activeUserResult.data)) {
      return failure(new NotFoundError('User not found'))
    }

    const activeUser = activeUserResult.data

    // パスワードチェック
    const validationResult = await this.validateCredentials(plainPassword, activeUser.password)
    if (isFailure(validationResult)) return failure(validationResult.error)

    return success(activeUser)
  }

  private async validateCredentials(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<Result<void, Error>> {
    const isValidPassword = await bcrypt.compare(plainPassword, hashedPassword)
    if (!isValidPassword) {
      return failure(new ClientError('Invalid credentials'))
    }
    return success(undefined)
  }

  private async createLoginSession(
    activeUserId: bigint,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Result<{ sessionId: string; expiresAt: Date }, Error>> {
    const sessionId = uuidv4()
    const expiresAt = new Date(Date.now() + SESSION_DURATION)

    const sessionResult = await this.command.createSession({
      sessionId,
      activeUserId,
      sessionToken: uuidv4(),
      expiresAt,
      ipAddress,
      userAgent,
    })

    if (isFailure(sessionResult)) {
      return failure(ServerError.handle(sessionResult.error))
    }

    return success({ sessionId, expiresAt })
  }

  async logout(sessionId: string): Promise<Result<void, Error>> {
    const result = await this.command.deleteSession(sessionId)
    if (isFailure(result)) return failure(ServerError.handle(result.error))
    return success(undefined)
  }

  async getCurrentUser(sessionId: string): AsyncResult<Nullable<CurrentUser>, Error> {
    const result = await this.query.findActiveBySessionId(sessionId)
    if (isFailure(result)) return failure(ServerError.handle(result.error))

    return success(result.data)
  }
}
