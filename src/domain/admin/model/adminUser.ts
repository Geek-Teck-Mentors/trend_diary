import { adminUserSchema } from '../schema/adminUserSchema'

export default class AdminUser {
  constructor(
    public adminUserId: number,
    public activeUserId: bigint,
    public grantedAt: Date,
    public grantedByAdminUserId: number,
  ) {
    // Zodスキーマを使ったバリデーション
    adminUserSchema.parse({
      adminUserId,
      activeUserId,
      grantedAt,
      grantedByAdminUserId,
    })
  }
}
