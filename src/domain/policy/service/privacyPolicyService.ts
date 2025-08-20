import { ClientError, NotFoundError, ServerError } from '@/common/errors'
import { OffsetPaginationResult } from '@/common/pagination'
import { isError, isNull, Result, resultError, resultSuccess } from '@/common/types/utility'
import { CommandService } from '../repository/commandService'
import { QueryService } from '../repository/queryService'
import type { PrivacyPolicy } from '../schema/privacyPolicySchema'

export default class PrivacyPolicyService {
  constructor(
    private queryService: QueryService,
    private commandService: CommandService,
  ) {}

  /**
   * 全てのプライバシーポリシーを取得する（ページング対応）
   * @param page ページ番号
   * @param limit 1ページあたりの件数
   * @returns ページング情報を含むプライバシーポリシーの配列
   */
  async getAllPolicies(
    page: number,
    limit: number,
  ): Promise<Result<OffsetPaginationResult<PrivacyPolicy>, Error>> {
    const result = await this.queryService.findAll(page, limit)
    if (isError(result)) return resultError(ServerError.handle(result.error))

    return resultSuccess(result.data)
  }

  /**
   * 指定したバージョンのプライバシーポリシーを取得する
   * @param version バージョン番号
   * @returns プライバシーポリシー
   */
  async getPolicyByVersion(version: number): Promise<Result<PrivacyPolicy, Error>> {
    const result = await this.queryService.findByVersion(version)
    if (isError(result)) return resultError(ServerError.handle(result.error))
    if (isNull(result.data)) {
      return resultError(
        new NotFoundError('指定されたバージョンのプライバシーポリシーが見つかりません'),
      )
    }

    return resultSuccess(result.data)
  }

  /**
   * 新しいプライバシーポリシーを作成する
   * @param content ポリシーの内容
   * @returns 作成されたプライバシーポリシー
   */
  async createPolicy(content: string): Promise<Result<PrivacyPolicy, Error>> {
    const versionResult = await this.queryService.getNextVersion()
    if (isError(versionResult)) return resultError(ServerError.handle(versionResult.error))

    const newPolicy = {
      version: versionResult.data,
      content,
      effectiveAt: null, // 下書き状態
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const saveResult = await this.commandService.save(newPolicy)
    if (isError(saveResult)) return resultError(ServerError.handle(saveResult.error))

    return resultSuccess(saveResult.data)
  }

  /**
   * プライバシーポリシーを更新する（下書き状態のみ）
   * @param version バージョン番号
   * @param content 新しい内容
   * @returns 更新されたプライバシーポリシー
   */
  async updatePolicy(version: number, content: string): Promise<Result<PrivacyPolicy, Error>> {
    const policyResult = await this.queryService.findByVersion(version)
    if (isError(policyResult)) return resultError(ServerError.handle(policyResult.error))
    if (isNull(policyResult.data)) {
      return resultError(
        new NotFoundError('指定されたバージョンのプライバシーポリシーが見つかりません'),
      )
    }

    const policy = policyResult.data

    // isDraftヘルパー関数の代わりにロジックを直接記述
    if (policy.effectiveAt !== null) {
      return resultError(new ClientError('有効化されたポリシーは更新できません'))
    }

    // updateContentメソッドのロジックを直接記述
    const updatedPolicy = {
      ...policy,
      content,
      updatedAt: new Date(),
    }

    const saveResult = await this.commandService.save(updatedPolicy)
    if (isError(saveResult)) return resultError(ServerError.handle(saveResult.error))

    return resultSuccess(saveResult.data)
  }

  /**
   * プライバシーポリシーを削除する（下書き状態のみ）
   * @param version バージョン番号
   * @returns 削除成功時はvoid
   */
  async deletePolicy(version: number): Promise<Result<void, Error>> {
    const policyResult = await this.queryService.findByVersion(version)
    if (isError(policyResult)) return resultError(ServerError.handle(policyResult.error))
    if (isNull(policyResult.data)) {
      return resultError(
        new NotFoundError('指定されたバージョンのプライバシーポリシーが見つかりません'),
      )
    }

    const policy = policyResult.data

    // isActiveメソッドの代わりにロジックを直接記述
    if (policy.effectiveAt !== null) {
      return resultError(new ClientError('有効化されたポリシーは削除できません'))
    }

    const deleteResult = await this.commandService.deleteByVersion(version)
    if (isError(deleteResult)) return resultError(ServerError.handle(deleteResult.error))

    return resultSuccess(undefined)
  }

  /**
   * 既存のプライバシーポリシーを複製する
   * @param sourceVersion 複製元のバージョン番号
   * @returns 複製されたプライバシーポリシー（下書き状態）
   */
  async clonePolicy(sourceVersion: number): Promise<Result<PrivacyPolicy, Error>> {
    const sourcePolicyResult = await this.queryService.findByVersion(sourceVersion)
    if (isError(sourcePolicyResult))
      return resultError(ServerError.handle(sourcePolicyResult.error))
    if (isNull(sourcePolicyResult.data)) {
      return resultError(new NotFoundError('複製元のプライバシーポリシーが見つかりません'))
    }

    const versionResult = await this.queryService.getNextVersion()
    if (isError(versionResult)) return resultError(ServerError.handle(versionResult.error))

    // cloneメソッドのロジックを直接記述
    const clonedPolicy = {
      version: versionResult.data,
      content: sourcePolicyResult.data.content,
      effectiveAt: null, // 下書き状態
      createdAt: new Date(), // 新しい作成日時
      updatedAt: new Date(), // 新しい更新日時
    }

    const saveResult = await this.commandService.save(clonedPolicy)
    if (isError(saveResult)) return resultError(ServerError.handle(saveResult.error))

    return resultSuccess(saveResult.data)
  }

  /**
   * プライバシーポリシーを有効化する（下書き状態のみ）
   * @param version バージョン番号
   * @param effectiveDate 有効開始日
   * @returns 有効化されたプライバシーポリシー
   */
  async activatePolicy(
    version: number,
    effectiveDate: Date,
  ): Promise<Result<PrivacyPolicy, Error>> {
    const policyResult = await this.queryService.findByVersion(version)
    if (isError(policyResult)) return resultError(ServerError.handle(policyResult.error))
    if (isNull(policyResult.data)) {
      return resultError(
        new NotFoundError('指定されたバージョンのプライバシーポリシーが見つかりません'),
      )
    }

    const policy = policyResult.data

    // activateメソッドのロジックを直接記述
    if (policy.effectiveAt !== null) {
      return resultError(new ClientError('このポリシーは既に有効化されています'))
    }

    const activatedPolicy = {
      ...policy,
      effectiveAt: effectiveDate,
      updatedAt: new Date(),
    }

    const saveResult = await this.commandService.save(activatedPolicy)
    if (isError(saveResult)) return resultError(ServerError.handle(saveResult.error))

    return resultSuccess(saveResult.data)
  }
}
