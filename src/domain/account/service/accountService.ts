import bcrypt from 'bcryptjs'
import { SESSION_DURATION } from '@/common/constants/session'
import {
  AsyncResult,
  isError,
  isNull,
  isSuccess,
  Result,
  resultError,
  resultSuccess,
} from '@/common/types/utility'
import { TransactionClient } from '@/infrastructure/rdb'
import { AlreadyExistsError, ClientError, NotFoundError, ServerError } from '../../../common/errors'
import ActiveUser from '../model/activeUser'
import User from '../model/user'
import { ActiveUserRepository } from '../repository/activeUserRepository'
import { UserRepository } from '../repository/userRepository'

type LoginResult = {
  user: User
  activeUser: ActiveUser
  sessionId: string
  expiredAt: Date
}

export default class AccountService {
  constructor(
    private activeUserRepository: ActiveUserRepository,
    private userRepository: UserRepository,
  ) {}

  async signup(
    transaction: TransactionClient,
    email: string,
    plainPassword: string,
    displayName?: string,
  ): Promise<Result<ActiveUser, Error>> {
    // 既にアクティブユーザーがあるかチェック
    const res = await this.activeUserRepository.findByEmail(email)
    if (isSuccess(res) && !isNull(res.data))
      return resultError(new AlreadyExistsError('ActiveUser already exists'))
    if (isError(res)) return resultError(ServerError.handle(res.error))

    const hashedPassword = await bcrypt.hash(plainPassword, 10)

    // ユーザー作成 & アクティブユーザー作成
    await transaction.begin()
    const userResult = await this.userRepository.create()
    if (isError(userResult)) {
      await transaction.rollback()
      return resultError(ServerError.handle(userResult.error))
    }

    const createResult = await this.activeUserRepository.createActiveUser(
      userResult.data.userId,
      email,
      hashedPassword,
      displayName,
    )
    if (isError(createResult)) {
      await transaction.rollback()
      return resultError(ServerError.handle(createResult.error))
    }

    await transaction.commit()

    return resultSuccess(createResult.data)
  }

  async login(email: string, plainPassword: string): Promise<Result<LoginResult, Error>> {
    // アクティブユーザーを検索
    const activeUserRes = await this.activeUserRepository.findByEmail(email)
    if (isError(activeUserRes)) return resultError(activeUserRes.error)

    const activeUser = activeUserRes.data
    if (isNull(activeUser)) return resultError(new NotFoundError('ActiveUser not found'))

    // パスワードの照合
    const isPasswordMatch = await bcrypt.compare(plainPassword, activeUser.password)
    if (!isPasswordMatch) return resultError(new ClientError('Invalid password'))

    // ログイン記録の更新
    activeUser.recordLogin()
    const saveRes = await this.activeUserRepository.save(activeUser)
    if (isError(saveRes)) return resultError(saveRes.error)

    // ユーザー情報の取得
    const userRes = await this.userRepository.findById(activeUser.userId)
    if (isError(userRes)) return resultError(userRes.error)

    const user = userRes.data
    if (isNull(user)) return resultError(new ServerError('User not found. this should not happen')) // signup時に作成されているはず

    const expiredAt = new Date(Date.now() + SESSION_DURATION)
    const addSessionRes = await this.activeUserRepository.addSession(
      activeUser.activeUserId,
      expiredAt,
    )
    if (isError(addSessionRes)) return resultError(addSessionRes.error)
    const sessionId = addSessionRes.data

    return resultSuccess({ user, activeUser, sessionId, expiredAt })
  }

  async getLoginUser(sessionId: string): AsyncResult<User, Error> {
    const activeUserRes = await this.activeUserRepository.findBySessionId(sessionId)
    if (isError(activeUserRes)) return resultError(activeUserRes.error)

    const activeUser = activeUserRes.data
    if (isNull(activeUser)) return resultError(new NotFoundError('ActiveUser not found'))

    const userRes = await this.userRepository.findById(activeUser.userId)
    if (isError(userRes)) return userRes

    const user = userRes.data
    if (isNull(user)) return resultError(new NotFoundError('User not found'))

    return resultSuccess(user)
  }

  async logout(sessionId: string): Promise<Result<void, Error>> {
    const activeUserRes = await this.activeUserRepository.findBySessionId(sessionId)
    if (isError(activeUserRes)) return resultError(activeUserRes.error)

    const activeUser = activeUserRes.data
    if (isNull(activeUser)) return resultError(new NotFoundError('ActiveUser not found'))

    const removeRes = await this.activeUserRepository.removeSession(sessionId)
    if (isError(removeRes)) return resultError(removeRes.error)

    return removeRes
  }
}
