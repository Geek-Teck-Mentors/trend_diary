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
import { isNull } from '@/common/types/utility';
import User from '../model/user';
import { TransactionClient } from '@/infrastructure/rdb';

export default class AccountService {
  constructor(
    private accountRepository: AccountRepository,
    private userRepository: UserRepository,
    private transaction: TransactionClient,
  ) {}

  async signup(email: string, plainPassword: string): Promise<Result<Account, Error>> {
    // 既にアカウントがあるかチェック
    const res = await this.accountRepository.findByEmail(email);
    if (res.isOk() && !isNull(res.value))
      return err(new AlreadyExistsError('Account already exists'));
    if (res.isErr()) return err(ServerError.handle(res.error));

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // アカウント作成 & ユーザー作成
    await this.transaction.begin();
    const createResult = await this.accountRepository
      .createAccount(email, hashedPassword)
      .andTee(async (account) => {
        await this.userRepository.create(account.accountId);
      });
    if (createResult.isErr()) {
      await this.transaction.rollback();
      return err(ServerError.handle(createResult.error));
    }
    await this.transaction.commit();

    return createResult;
  }

  async login(email: string, plainPassword: string): Promise<Result<User, Error>> {
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

    return ok(user);
  }

  // // ログアウト
  // async logout(accountId: bigint): Promise<void> {
  //   const account = await this.accountRepository.findById(accountId);
  //   if (isNull(account)) throw ACCOUNT_NOT_FOUND;

  //   // TODO: 後でセッションの削除処理を追加
  // }

  // // アカウントの削除
  // async deactivateAccount(accountId: bigint): Promise<void> {
  //   const account = await this.accountRepository.findById(accountId);
  //   if (isNull(account)) throw ACCOUNT_NOT_FOUND;

  //   try {
  //     await this.accountRepository.delete(account);
  //   } catch (error) {
  //     throw ServerError.handle(error);
  //   }
  // }
}
