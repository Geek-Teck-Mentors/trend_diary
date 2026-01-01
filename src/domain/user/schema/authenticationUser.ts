/**
 * 認証ユーザーモデル
 */
export type AuthenticationUser = {
  id: string
  email: string
  emailConfirmedAt?: Date | null
  createdAt: Date
}
