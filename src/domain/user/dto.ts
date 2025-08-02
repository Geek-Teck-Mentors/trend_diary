export type CreateSessionInput = {
  sessionId: string
  activeUserId: bigint
  expiresAt: Date
  sessionToken?: string | null | undefined
  ipAddress?: string | null | undefined
  userAgent?: string | null | undefined
}
