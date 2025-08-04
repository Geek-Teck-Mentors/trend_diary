import { OffsetPaginationResult } from '@/common/pagination'
import { AsyncResult, Nullable } from '@/common/types/utility'
import PrivacyPolicy from '../model/privacyPolicy'

export interface QueryService {
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
