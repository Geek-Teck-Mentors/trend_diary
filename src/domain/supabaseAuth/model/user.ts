/**
 * Supabase Auth ユーザーモデル
 */
export type SupabaseAuthUser = {
  id: string
  email: string
  emailConfirmedAt?: Date | null
  createdAt: Date
}
