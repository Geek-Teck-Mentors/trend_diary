import { SupabaseClient } from '@supabase/supabase-js'
import { RdbClient } from '@/infrastructure/rdb'
import CommandImpl from './infrastructure/command-impl'
import QueryImpl from './infrastructure/query-impl'
import { SupabaseAuthRepository } from './infrastructure/supabase-auth-repository'
import { AuthV2UseCase } from './use-case'

export function createAuthV2UseCase(client: SupabaseClient, db: RdbClient): AuthV2UseCase {
  const repository = new SupabaseAuthRepository(client)
  const userCommand = new CommandImpl(db)
  const userQuery = new QueryImpl(db)
  return new AuthV2UseCase(repository, userCommand, userQuery)
}
