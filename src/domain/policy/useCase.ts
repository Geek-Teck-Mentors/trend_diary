import { PrivacyPolicy } from '@prisma/client'
import { failure, isFailure, Result, success } from '@yuukihayashi0510/core'
import { ClientError, NotFoundError, ServerError } from '@/common/errors'
import { OffsetPaginationResult } from '@/common/pagination'
import { isNull } from '@/common/types/utility'
import { Command, Query } from './repository'
import { activate, isActive, newPrivacyPolicy, updateContent } from './schema/method'

export class UseCase {
  constructor(
    private query: Query,
    private command: Command,
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
    const result = await this.query.findAll(page, limit)
    if (isFailure(result)) return result

    return success(result.data)
  }

  /**
   * 指定したバージョンのプライバシーポリシーを取得する
   * @param version バージョン番号
   * @returns プライバシーポリシー
   */
  async getPolicyByVersion(version: number): Promise<Result<PrivacyPolicy, Error>> {
    const result = await this.query.findByVersion(version)
    if (isFailure(result)) return failure(ServerError.handle(result.error))
    if (isNull(result.data)) {
      return failure(
        new NotFoundError('指定されたバージョンのプライバシーポリシーが見つかりません'),
      )
    }

    return success(result.data)
  }

  /**
   * 新しいプライバシーポリシーを作成する
   * @param content ポリシーの内容
   * @returns 作成されたプライバシーポリシー
   */
  async createPolicy(content: string): Promise<Result<PrivacyPolicy, Error>> {
    const versionResult = await this.query.getNextVersion()
    if (isFailure(versionResult)) return failure(ServerError.handle(versionResult.error))

    const newPolicy = newPrivacyPolicy(versionResult.data, content)
    const saveResult = await this.command.save(newPolicy)
    if (isFailure(saveResult)) return failure(ServerError.handle(saveResult.error))

    return success(saveResult.data)
  }

  /**
   * プライバシーポリシーを更新する（下書き状態のみ）
   * @param version バージョン番号
   * @param content 新しい内容
   * @returns 更新されたプライバシーポリシー
   */
  async updatePolicy(version: number, content: string): Promise<Result<PrivacyPolicy, Error>> {
    const policyResult = await this.query.findByVersion(version)
    if (isFailure(policyResult)) return failure(ServerError.handle(policyResult.error))
    if (isNull(policyResult.data)) {
      return failure(
        new NotFoundError('指定されたバージョンのプライバシーポリシーが見つかりません'),
      )
    }

    const policy = policyResult.data
    if (isActive(policy)) {
      return failure(new ClientError('有効化されたポリシーは更新できません'))
    }

    const updatedPolicyResult = updateContent(policy, content)
    if (isFailure(updatedPolicyResult)) return updatedPolicyResult

    const saveResult = await this.command.save(updatedPolicyResult.data)
    if (isFailure(saveResult)) return failure(ServerError.handle(saveResult.error))

    return saveResult
  }

  /**
   * プライバシーポリシーを削除する（下書き状態のみ）
   * @param version バージョン番号
   * @returns 削除成功時はvoid
   */
  async deletePolicy(version: number): Promise<Result<void, Error>> {
    const policyResult = await this.query.findByVersion(version)
    if (isFailure(policyResult)) return failure(ServerError.handle(policyResult.error))
    if (isNull(policyResult.data)) {
      return failure(
        new NotFoundError('指定されたバージョンのプライバシーポリシーが見つかりません'),
      )
    }
    if (isActive(policyResult.data)) {
      return failure(new ClientError('有効化されたポリシーは削除できません'))
    }

    const deleteResult = await this.command.deleteByVersion(version)
    if (isFailure(deleteResult)) return failure(ServerError.handle(deleteResult.error))

    return success(undefined)
  }

  /**
   * 既存のプライバシーポリシーを複製する
   * @param sourceVersion 複製元のバージョン番号
   * @returns 複製されたプライバシーポリシー（下書き状態）
   */
  async clonePolicy(sourceVersion: number): Promise<Result<PrivacyPolicy, Error>> {
    const sourcePolicyResult = await this.query.findByVersion(sourceVersion)
    if (isFailure(sourcePolicyResult)) return failure(ServerError.handle(sourcePolicyResult.error))
    if (isNull(sourcePolicyResult.data)) {
      return failure(new NotFoundError('複製元のプライバシーポリシーが見つかりません'))
    }

    const versionResult = await this.query.getNextVersion()
    if (isFailure(versionResult)) return failure(ServerError.handle(versionResult.error))

    const clonedPolicy = newPrivacyPolicy(versionResult.data, sourcePolicyResult.data.content)

    const saveResult = await this.command.save(clonedPolicy)
    if (isFailure(saveResult)) return failure(ServerError.handle(saveResult.error))

    return saveResult
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
    const policyResult = await this.query.findByVersion(version)
    if (isFailure(policyResult)) return failure(ServerError.handle(policyResult.error))
    if (isNull(policyResult.data)) {
      return failure(
        new NotFoundError('指定されたバージョンのプライバシーポリシーが見つかりません'),
      )
    }

    const policy = policyResult.data
    if (isActive(policy)) {
      return failure(new ClientError('このポリシーは既に有効化されています'))
    }

    const activatedPolicyResult = activate(policy, effectiveDate)
    if (isFailure(activatedPolicyResult)) return activatedPolicyResult

    const saveResult = await this.command.save(activatedPolicyResult.data)
    if (isFailure(saveResult)) return failure(ServerError.handle(saveResult.error))

    return saveResult
  }
}
