export type SupabaseAuthUser = {
  id: string
  email: string
  emailConfirmedAt?: Date | null
  createdAt: Date
}

export type SupabaseAuthSession = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  expiresAt?: number
  user: SupabaseAuthUser
}

export type SignupResult = {
  user: SupabaseAuthUser
  session: SupabaseAuthSession | null
}

export type LoginResult = {
  user: SupabaseAuthUser
  session: SupabaseAuthSession
}
