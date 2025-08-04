export default class PrivacyPolicy {
  constructor(
    public version: number,
    public content: string,
    public effectiveAt: Date | null,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  /**
   * ポリシーが下書き状態かどうかを判定する
   * @returns effectiveAtがnullの場合true
   */
  isDraft(): boolean {
    return this.effectiveAt === null
  }

  /**
   * ポリシーが有効化されているかどうかを判定する
   * @returns effectiveAtがnullでない場合true
   */
  isActive(): boolean {
    return this.effectiveAt !== null
  }

  /**
   * ポリシーを有効化する
   * @param effectiveDate 有効開始日
   * @throws 既に有効化されている場合はエラー
   */
  activate(effectiveDate: Date): void {
    if (this.isActive()) {
      throw new Error('このポリシーは既に有効化されています')
    }

    this.effectiveAt = effectiveDate
    this.updatedAt = new Date()
  }

  /**
   * ポリシーのコンテンツを更新する
   * @param newContent 新しいコンテンツ
   * @throws 有効化されたポリシーの場合はエラー
   */
  updateContent(newContent: string): void {
    if (this.isActive()) {
      throw new Error('有効化されたポリシーは編集できません')
    }

    this.content = newContent
    this.updatedAt = new Date()
  }

  /**
   * 既存ポリシーから新しい下書きポリシーを作成する
   * @param newVersion 新しいバージョン番号
   * @returns 複製された下書きポリシー
   */
  clone(newVersion: number): PrivacyPolicy {
    return new PrivacyPolicy(
      newVersion,
      this.content,
      null, // 下書き状態
      new Date(), // 新しい作成日時
      new Date(), // 新しい更新日時
    )
  }
}
