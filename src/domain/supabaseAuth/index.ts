import type { SupabaseClient } from '@supabase/supabase-js'
import { SupabaseAuthenticationImpl } from './infrastructure/supabaseAuthImpl'
import { SupabaseAuthenticationUseCase } from './useCase'

export function createSupabaseAuthenticationUseCase(
  client: SupabaseClient,
): SupabaseAuthenticationUseCase {
  const repository = new SupabaseAuthenticationImpl(client)
  return new SupabaseAuthenticationUseCase(repository)
}

export type { SupabaseAuthenticationRepository } from './repository'
export * from './schema/authSchema'
export type { AuthenticationSession } from './schema/session'
export type { AuthenticationUser } from './schema/user'
export type { LoginResult, SignupResult } from './useCase'
export { SupabaseAuthenticationUseCase } from './useCase'
