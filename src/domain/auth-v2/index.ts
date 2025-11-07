import type { SupabaseClient } from '@supabase/supabase-js'
import CommandImpl from '@/domain/user/infrastructure/commandImpl'
import QueryImpl from '@/domain/user/infrastructure/queryImpl'
import type { RdbClient } from '@/infrastructure/rdb'
import { AuthV2Impl } from './infrastructure/authV2Impl'
import { AuthV2UseCase } from './useCase'

export function createAuthV2UseCase(client: SupabaseClient, db: RdbClient): AuthV2UseCase {
  const repository = new AuthV2Impl(client)
  const userQuery = new QueryImpl(db)
  const userCommand = new CommandImpl(db)
  return new AuthV2UseCase(repository, userQuery, userCommand)
}

export type { AuthV2Repository } from './repository'
export type { AuthenticationSession } from './schema/authenticationSession'
export type { AuthenticationUser } from './schema/authenticationUser'
export * from './schema/authSchema'
export type { LoginResult, SignupResult } from './useCase'
export { AuthV2UseCase } from './useCase'
