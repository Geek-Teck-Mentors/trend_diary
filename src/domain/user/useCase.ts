import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { SESSION_DURATION } from '@/common/constant'
import { AlreadyExistsError, ClientError, NotFoundError, ServerError } from '@/common/errors'
import {
  AsyncResult,
  isError,
  isNull,
  Nullable,
  Result,
  resultError,
  resultSuccess,
} from '@/common/types/utility'
import { Command, Query } from './repository'
import type { ActiveUser } from './schema/activeUserSchema'
import { recordLogin } from './schema/method'

type LoginResult = {
  activeUser: ActiveUser
  sessionId: string
  expiresAt: Date
}

export class UseCase {
  constructor(
    private query: Query,
    private command: Command,
  ) {}

  async signup(email: string, plainPassword: string): Promise<Result<ActiveUser, Error>> {
    const existingResult = await this.query.findActiveByEmail(email)
    if (isError(existingResult)) return resultError(ServerError.handle(existingResult.error))
    if (!isNull(existingResult.data)) {
      return resultError(new AlreadyExistsError('Email already exists'))
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10)

    const activeUserResult = await this.command.createActive(email, hashedPassword)
    if (isError(activeUserResult)) {
      return resultError(ServerError.handle(activeUserResult.error))
    }

    return resultSuccess(activeUserResult.data)
  }

  async login(
    email: string,
    plainPassword: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Result<LoginResult, Error>> {
    const authResult = await this.authenticateUser(email, plainPassword)
    if (isError(authResult)) return resultError(authResult.error)

    const sessionResult = await this.createLoginSession(
      authResult.data.activeUserId,
      ipAddress,
      userAgent,
    )
    if (isError(sessionResult)) return resultError(sessionResult.error)

    const { sessionId, expiresAt } = sessionResult.data

    const updatedUser = recordLogin(authResult.data)
    const updateResult = await this.command.saveActive(updatedUser)
    if (isError(updateResult)) return resultError(updateResult.error)

    return resultSuccess({
      activeUser: updateResult.data,
      sessionId,
      expiresAt,
    })
  }

  private async authenticateUser(
    email: string,
    plainPassword: string,
  ): Promise<Result<ActiveUser, Error>> {
    const activeUserResult = await this.query.findActiveByEmail(email)
    if (isError(activeUserResult)) return resultError(ServerError.handle(activeUserResult.error))
    if (isNull(activeUserResult.data)) {
      return resultError(new NotFoundError('User not found'))
    }

    const activeUser = activeUserResult.data

    // パスワードチェック
    const validationResult = await this.validateCredentials(plainPassword, activeUser.password)
    if (isError(validationResult)) return resultError(validationResult.error)

    return resultSuccess(activeUser)
  }

  private async validateCredentials(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<Result<void, Error>> {
    const isValidPassword = await bcrypt.compare(plainPassword, hashedPassword)
    if (!isValidPassword) {
      return resultError(new ClientError('Invalid credentials'))
    }
    return resultSuccess(undefined)
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

    if (isError(sessionResult)) {
      return resultError(ServerError.handle(sessionResult.error))
    }

    return resultSuccess({ sessionId, expiresAt })
  }

  async logout(sessionId: string): Promise<Result<void, Error>> {
    const result = await this.command.deleteSession(sessionId)
    if (isError(result)) return resultError(ServerError.handle(result.error))
    return resultSuccess(undefined)
  }

  async getCurrentUser(sessionId: string): AsyncResult<Nullable<ActiveUser>, Error> {
    const result = await this.query.findActiveBySessionId(sessionId)
    if (isError(result)) return resultError(ServerError.handle(result.error))

    return resultSuccess(result.data)
  }
}
