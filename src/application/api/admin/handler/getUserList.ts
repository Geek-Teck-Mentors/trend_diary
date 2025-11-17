import { z } from 'zod'
import { createSimpleApiHandler, type RequestContext } from '@/application/api/handler/factory'
import { createAdminUserUseCase } from '@/domain/admin'
import { UserListResult } from '@/domain/admin/schema/userListSchema'
import { User } from '@/domain/admin/schema/userSchema'

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
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
})

export default createSimpleApiHandler({
  createUseCase: createAdminUserUseCase,
  execute: (useCase, context: RequestContext<unknown, unknown, z.infer<typeof querySchema>>) =>
    useCase.getUserList({
      searchQuery: context.query.searchQuery,
      page: context.query.page,
      limit: context.query.limit,
    }),
  transform: (data) => ({
    users: data.users.map((user) => ({
      activeUserId: user.activeUserId.toString(),
      email: user.email,
      displayName: user.displayName,
      hasAdminAccess: user.hasAdminAccess,
      grantedAt: user.grantedAt?.toISOString() || null,
      grantedByAdminUserId: user.grantedByAdminUserId,
      createdAt: user.createdAt.toISOString(),
    })),
    total: data.total,
    page: data.page,
    limit: data.limit,
  }),
  logMessage: 'User list retrieved successfully',
  logPayload: (data) => ({ count: data.users.length, total: data.total }),
  statusCode: 200,
})
