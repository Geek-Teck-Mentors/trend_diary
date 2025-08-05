import { AsyncResult } from '@/common/types/utility'
import PrivacyPolicy from '../model/privacyPolicy'

export interface CommandService {
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
