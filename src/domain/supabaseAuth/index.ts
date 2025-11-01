import type { SupabaseClient } from '@supabase/supabase-js'
import CommandImpl from '@/domain/user/infrastructure/commandImpl'
import QueryImpl from '@/domain/user/infrastructure/queryImpl'
import type { RdbClient } from '@/infrastructure/rdb'
import { SupabaseAuthenticationImpl } from './infrastructure/supabaseAuthImpl'
import { SupabaseAuthenticationUseCase } from './useCase'

export function createSupabaseAuthenticationUseCase(
  client: SupabaseClient,
  db: RdbClient,
): SupabaseAuthenticationUseCase {
  const repository = new SupabaseAuthenticationImpl(client)
  const userQuery = new QueryImpl(db)
  const userCommand = new CommandImpl(db)
  return new SupabaseAuthenticationUseCase(repository, userQuery, userCommand)
}

export type { SupabaseAuthenticationRepository } from './repository'
export type { AuthenticationSession } from './schema/authenticationSession'
export type { AuthenticationUser } from './schema/authenticationUser'
export * from './schema/authSchema'
export type { LoginResult, SignupResult } from './useCase'
export { SupabaseAuthenticationUseCase } from './useCase'
