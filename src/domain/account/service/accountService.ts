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
import Account from '../model/account'
import User from '../model/user'
import { AccountRepository } from '../repository/accountRepository'
import { UserRepository } from '../repository/userRepository'

type LoginResult = {
  user: User
  sessionId: string
  expiredAt: Date
}

export default class AccountService {
  constructor(
    private accountRepository: AccountRepository,
    private userRepository: UserRepository,
  ) {}

  async signup(
    transaction: TransactionClient,
    email: string,
    plainPassword: string,
  ): Promise<Result<Account, Error>> {
    // 既にアカウントがあるかチェック
    const res = await this.accountRepository.findByEmail(email)
    if (isSuccess(res) && !isNull(res.data))
      return resultError(new AlreadyExistsError('Account already exists'))
    if (isError(res)) return resultError(ServerError.handle(res.error))

    const hashedPassword = await bcrypt.hash(plainPassword, 10)

    // アカウント作成 & ユーザー作成
    await transaction.begin()
    const createResult = await this.accountRepository.createAccount(email, hashedPassword)
    if (isError(createResult)) {
      await transaction.rollback()
      return resultError(ServerError.handle(createResult.error))
    }

    const userResult = await this.userRepository.create(createResult.data.accountId)
    if (isError(userResult)) {
      await transaction.rollback()
      return resultError(ServerError.handle(userResult.error))
    }

    await transaction.commit()

    return resultSuccess(createResult.data)
  }

  async login(email: string, plainPassword: string): Promise<Result<LoginResult, Error>> {
    // アカウントを検索
    const accountRes = await this.accountRepository.findByEmail(email)
    if (isError(accountRes)) return resultError(accountRes.error)

    const account = accountRes.data
    if (isNull(account)) return resultError(new NotFoundError('Account not found'))

    // パスワードの照合
    const isPasswordMatch = await bcrypt.compare(plainPassword, account.password)
    if (!isPasswordMatch) return resultError(new ClientError('Invalid password'))

    // ログイン記録の更新
    account.recordLogin()
    const saveRes = await this.accountRepository.save(account)
    if (isError(saveRes)) return resultError(saveRes.error)

    // ユーザー情報の取得
    const userRes = await this.userRepository.findByAccountId(account.accountId)
    if (isError(userRes)) return resultError(userRes.error)

    const user = userRes.data
    if (isNull(user)) return resultError(new ServerError('User not found. this should not happen')) // signup時に作成されているはず

    const expiredAt = new Date(Date.now() + SESSION_DURATION)
    const addSessionRes = await this.accountRepository.addSession(account.accountId, expiredAt)
    if (isError(addSessionRes)) return resultError(addSessionRes.error)
    const sessionId = addSessionRes.data

    return resultSuccess({ user, sessionId, expiredAt })
  }

  async getLoginUser(sessionId: string): AsyncResult<User, Error> {
    const userRes = await this.userRepository.findBySessionId(sessionId)
    if (isError(userRes)) return userRes

    const user = userRes.data
    if (isNull(user)) return resultError(new NotFoundError('User not found'))

    return resultSuccess(user)
  }

  async logout(sessionId: string): Promise<Result<void, Error>> {
    const accountRes = await this.accountRepository.findBySessionId(sessionId)
    if (isError(accountRes)) return resultError(accountRes.error)

    const account = accountRes.data
    if (isNull(account)) return resultError(new NotFoundError('Account not found'))

    const removeRes = await this.accountRepository.removeSession(sessionId)
    if (isError(removeRes)) return resultError(removeRes.error)

    return removeRes
  }
}
