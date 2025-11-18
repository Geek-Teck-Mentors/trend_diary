import type { SupabaseClient } from '@supabase/supabase-js'
import CommandImpl from '@/domain/user/infrastructure/commandImpl'
import QueryImpl from '@/domain/user/infrastructure/queryImpl'
import type { RdbClient } from '@/infrastructure/rdb'
import { SupabaseAuthRepository } from './infrastructure/supabaseAuthRepository'
import { AuthV2UseCase } from './useCase'

export function createAuthV2UseCase(client: SupabaseClient, db: RdbClient): AuthV2UseCase {
  const repository = new SupabaseAuthRepository(client)
  const userCommand = new CommandImpl(db)
  const userQuery = new QueryImpl(db)
  return new AuthV2UseCase(repository, userCommand, userQuery)
}

export type { AuthV2Repository } from './repository'
export type { AuthenticationSession } from './schema/authenticationSession'
export type { AuthenticationUser } from './schema/authenticationUser'
export * from './schema/authSchema'
export type { LoginResult, SignupResult } from './useCase'
export { AuthV2UseCase } from './useCase'
