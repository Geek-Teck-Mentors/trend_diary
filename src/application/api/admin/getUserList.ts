import { z } from 'zod'
import CONTEXT_KEY from '@/application/middleware/context'
import { ZodValidatedQueryContext } from '@/application/middleware/zodValidator'
import { handleError } from '@/common/errors'
import { isError } from '@/common/types/utility'
import { createAdminUserUseCase } from '@/domain/admin'
import { UserListResult } from '@/domain/admin/schema/userListSchema'
import { User } from '@/domain/admin/schema/userSchema'
import getRdbClient from '@/infrastructure/rdb'

interface ApiUser extends Omit<User, 'activeUserId' | 'grantedAt' | 'createdAt'> {
  activeUserId: string
  grantedAt: string | null
  createdAt: string
}

export interface UserListResponse extends Omit<UserListResult, 'users'> {
  users: ApiUser[]
}

export const querySchema = z.object({
  searchQuery: z.string().optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
})

export default async function getUserList(
  c: ZodValidatedQueryContext<z.infer<typeof querySchema>>,
) {
  const logger = c.get(CONTEXT_KEY.APP_LOG)
  const parsedQuery = c.req.valid('query')

  const rdb = getRdbClient(c.env.DATABASE_URL)
  const adminUserService = createAdminUserUseCase(rdb)

  const result = await adminUserService.getUserList({
    searchQuery: parsedQuery.searchQuery,
    page: parsedQuery.page,
    limit: parsedQuery.limit,
  })
  if (isError(result)) {
    logger.error('Failed to get user list', { error: result.error })
    throw handleError(result.error, logger)
  }

  return c.json({
    users: result.data.users.map((user) => ({
      activeUserId: user.activeUserId.toString(),
      email: user.email,
      displayName: user.displayName,
      isAdmin: user.isAdmin,
      grantedAt: user.grantedAt?.toISOString() || null,
      grantedByAdminUserId: user.grantedByAdminUserId,
      createdAt: user.createdAt.toISOString(),
    })),
    total: result.data.total,
    page: parsedQuery.page,
    limit: parsedQuery.limit,
  })
}
