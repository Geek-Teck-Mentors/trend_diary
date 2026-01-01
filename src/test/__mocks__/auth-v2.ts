import { vi } from 'vitest'
import { mockCommand, mockQuery, mockRepository } from '@/test/helper/authV2TestHelper'

// SupabaseAuthRepositoryをモックして、MockAuthV2Repositoryを使う
vi.mock('@/domain/user/infrastructure/supabase-auth-repository', () => ({
  SupabaseAuthRepository: vi.fn(() => mockRepository),
}))

// QueryImplをモック
vi.mock('@/domain/user/infrastructure/query-impl', () => ({
  default: vi.fn(() => mockQuery),
}))

// CommandImplをモック
vi.mock('@/domain/user/infrastructure/command-impl', () => ({
  default: vi.fn(() => mockCommand),
}))

// createSupabaseAuthClientはモックして何も返さない（使われないため）
vi.mock('@/infrastructure/supabase', () => ({
  createSupabaseAuthClient: () => ({}),
}))
