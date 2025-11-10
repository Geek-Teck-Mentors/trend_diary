// フロントエンド専用の型定義（API実装に依存しない）

export interface AdminUser {
  activeUserId: string
  email: string
  displayName: string | null
  isAdmin: boolean
  grantedAt: string | null
  grantedByAdminUserId: number | null
  createdAt: string
}

export interface UserListResponse {
  users: AdminUser[]
  total: number
  page: number
  limit: number
}
