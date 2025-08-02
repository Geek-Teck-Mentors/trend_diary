import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { SESSION_DURATION } from '@/common/constants/session'
import { AlreadyExistsError, ClientError, NotFoundError, ServerError } from '@/common/errors'
import {
  isError,
  isNull,
  isSuccess,
  Result,
  resultError,
  resultSuccess,
} from '@/common/types/utility'
import { TransactionClient } from '@/infrastructure/rdb'
import ActiveUser from '../model/activeUser'
import User from '../model/user'
import { ActiveUserRepository } from '../repository/activeUserRepository'
import { SessionRepository } from '../repository/sessionRepository'
import { UserRepository } from '../repository/userRepository'

type LoginResult = {
  user: User
  activeUser: ActiveUser
  sessionId: string
  expiresAt: Date
}

export default class ActiveUserService {
  constructor(
    private activeUserRepository: ActiveUserRepository,
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository,
  ) {}

  async signup(
    transaction: TransactionClient,
    email: string,
    plainPassword: string,
    displayName?: string | null,
  ): Promise<Result<ActiveUser, Error>> {
    // 既にActiveUserがあるかチェック
    const existingResult = await this.activeUserRepository.findByEmail(email)
    if (isSuccess(existingResult) && !isNull(existingResult.data))
      return resultError(new AlreadyExistsError('Email already exists'))
    if (isError(existingResult)) return resultError(ServerError.handle(existingResult.error))

    const hashedPassword = await bcrypt.hash(plainPassword, 10)

    // User作成 & ActiveUser作成
    await transaction.begin()

    // 1. User作成
    const userResult = await this.userRepository.create()
    if (isError(userResult)) {
      await transaction.rollback()
      return resultError(ServerError.handle(userResult.error))
    }

    // 2. ActiveUser作成
    const activeUserResult = await this.activeUserRepository.createActiveUser(
      userResult.data.userId,
      email,
      hashedPassword,
      displayName ?? undefined,
    )
    if (isError(activeUserResult)) {
      await transaction.rollback()
      return resultError(ServerError.handle(activeUserResult.error))
    }

    await transaction.commit()
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

    const { user, activeUser } = authResult.data

    const sessionResult = await this.createLoginSession(
      activeUser.activeUserId,
      ipAddress,
      userAgent,
    )
    if (isError(sessionResult)) return resultError(sessionResult.error)

    const { sessionId, expiresAt } = sessionResult.data

    // lastLoginを更新
    activeUser.recordLogin()
    const updateResult = await this.activeUserRepository.save(activeUser)
    if (isError(updateResult)) return resultError(updateResult.error)

    return resultSuccess({
      user,
      activeUser: updateResult.data,
      sessionId,
      expiresAt,
    })
  }

  private async authenticateUser(
    email: string,
    plainPassword: string,
  ): Promise<Result<{ user: User; activeUser: ActiveUser }, Error>> {
    // ActiveUserを探す
    const activeUserResult = await this.activeUserRepository.findByEmail(email)
    if (isError(activeUserResult)) return resultError(ServerError.handle(activeUserResult.error))
    if (isSuccess(activeUserResult) && isNull(activeUserResult.data))
      return resultError(new NotFoundError('User not found'))

    const activeUser = activeUserResult.data!

    // パスワードチェック
    const validationResult = await this.validateCredentials(plainPassword, activeUser.password)
    if (isError(validationResult)) return resultError(validationResult.error)

    // Userも取得
    const userResult = await this.userRepository.findById(activeUser.userId)
    if (isError(userResult)) return resultError(ServerError.handle(userResult.error))
    if (isSuccess(userResult) && isNull(userResult.data))
      return resultError(new NotFoundError('User not found'))

    const user = userResult.data!

    return resultSuccess({ user, activeUser })
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

    const sessionResult = await this.sessionRepository.create({
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
    const result = await this.sessionRepository.delete(sessionId)
    if (isError(result)) return resultError(ServerError.handle(result.error))
    return resultSuccess(undefined)
  }

  async findBySessionId(
    sessionId: string,
  ): Promise<Result<{ user: User; activeUser: ActiveUser } | null, Error>> {
    const activeUserResult = await this.activeUserRepository.findBySessionId(sessionId)
    if (isError(activeUserResult)) return resultError(ServerError.handle(activeUserResult.error))
    if (isSuccess(activeUserResult) && isNull(activeUserResult.data)) return resultSuccess(null)

    const activeUser = activeUserResult.data!

    const userResult = await this.userRepository.findById(activeUser.userId)
    if (isError(userResult)) return resultError(ServerError.handle(userResult.error))
    if (isSuccess(userResult) && isNull(userResult.data)) return resultSuccess(null)

    const user = userResult.data!

    return resultSuccess({ user, activeUser })
  }
}
