import bcrypt from 'bcryptjs';
import { err, ok, Result } from 'neverthrow';
import { AccountRepository } from '../repository/accountRepository';
import {
  AlreadyExistsError,
  ClientError,
  NotFoundError,
  ServerError,
} from '../../../common/errors';
import { UserRepository } from '../repository/userRepository';
import Account from '../model/account';
import { AsyncResult, isError, isNull, resultError, resultSuccess } from '@/common/types/utility';
import User from '../model/user';
import { TransactionClient } from '@/infrastructure/rdb';
import { SESSION_DURATION } from '@/common/constants/session';

type LoginResult = {
  user: User;
  sessionId: string;
  expiredAt: Date;
};

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
    const res = await this.accountRepository.findByEmail(email);
    if (res.isOk() && !isNull(res.value))
      return err(new AlreadyExistsError('Account already exists'));
    if (res.isErr()) return err(ServerError.handle(res.error));

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // アカウント作成 & ユーザー作成
    await transaction.begin();
    const createResult = await this.accountRepository
      .createAccount(email, hashedPassword)
      .andTee(async (account) => {
        await this.userRepository.create(account.accountId);
      });
    if (createResult.isErr()) {
      await transaction.rollback();
      return err(ServerError.handle(createResult.error));
    }
    await transaction.commit();

    return createResult;
  }

  async login(email: string, plainPassword: string): Promise<Result<LoginResult, Error>> {
    // アカウントを検索
    const accountRes = await this.accountRepository.findByEmail(email);
    if (accountRes.isErr()) return err(accountRes.error);

    const account = accountRes.value;
    if (isNull(account)) return err(new NotFoundError('Account not found'));

    // パスワードの照合
    const isPasswordMatch = await bcrypt.compare(plainPassword, account.password);
    if (!isPasswordMatch) return err(new ClientError('Invalid password'));

    // ログイン記録の更新
    account.recordLogin();
    const saveRes = await this.accountRepository.save(account);
    if (saveRes.isErr()) return err(saveRes.error);

    // ユーザー情報の取得
    const userRes = await this.userRepository.findByAccountId(account.accountId);
    if (userRes.isErr()) return err(userRes.error);

    const user = userRes.value;
    if (isNull(user)) return err(new ServerError('User not found. this should not happen')); // signup時に作成されているはず

    const expiredAt = new Date(Date.now() + SESSION_DURATION);
    const addSessionRes = await this.accountRepository.addSession(account.accountId, expiredAt);
    if (addSessionRes.isErr()) return err(addSessionRes.error);
    const sessionId = addSessionRes.value;

    return ok({ user, sessionId, expiredAt });
  }

  async getLoginUser(sessionId: string): AsyncResult<User, Error> {
    const userRes = await this.userRepository.findBySessionId(sessionId);
    if (isError(userRes)) return userRes;

    const user = userRes.data;
    if (isNull(user)) return resultError(new NotFoundError('User not found'));

    return resultSuccess(user);
  }

  async logout(sessionId: string): Promise<Result<void, Error>> {
    const accountRes = await this.accountRepository.findBySessionId(sessionId);
    if (accountRes.isErr()) return err(accountRes.error);

    const account = accountRes.value;
    if (isNull(account)) return err(new NotFoundError('Account not found'));

    const removeRes = await this.accountRepository.removeSession(sessionId);
    if (removeRes.isErr()) return err(removeRes.error);

    return removeRes;
  }
}
