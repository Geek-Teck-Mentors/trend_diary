import { AsyncResult } from '@yuukihayashi0510/core'
import { OffsetPaginationResult } from '@/common/pagination'
import { Nullable } from '@/common/types/utility'
import type { PrivacyPolicy } from './schema/privacyPolicySchema'

export interface Query {
  /**
   * 全てのプライバシーポリシーを取得する（ページング対応）
   * @param page ページ番号
   * @param limit 1ページあたりの件数
   * @returns ページング情報を含むプライバシーポリシーの配列
   */
  findAll(page: number, limit: number): AsyncResult<OffsetPaginationResult<PrivacyPolicy>, Error>

  /**
   * 指定したバージョンのプライバシーポリシーを取得する
   * @param version バージョン番号
   * @returns プライバシーポリシー、または存在しない場合はnull
   */
  findByVersion(version: number): AsyncResult<Nullable<PrivacyPolicy>, Error>

  /**
   * 最新の下書きプライバシーポリシーを取得する
   * @returns 下書き状態のプライバシーポリシー、または存在しない場合はnull
   */
  getLatestDraft(): AsyncResult<Nullable<PrivacyPolicy>, Error>

  /**
   * 次のバージョン番号を取得する
   * @returns 次のバージョン番号
   */
  getNextVersion(): AsyncResult<number, Error>
}

export interface Command {
  /**
   * プライバシーポリシーを保存する（新規作成・更新両対応）
   * @param policy 保存するプライバシーポリシー
   * @returns 保存されたプライバシーポリシー
   */
  save(policy: PrivacyPolicy): AsyncResult<PrivacyPolicy, Error>

  /**
   * 指定したバージョンのプライバシーポリシーを削除する
   * @param version 削除するバージョン番号
   * @returns 削除成功時はvoid
   */
  deleteByVersion(version: number): AsyncResult<void, Error>
}
