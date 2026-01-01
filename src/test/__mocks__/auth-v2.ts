import { vi } from 'vitest'
import { mockCommand, mockQuery, mockRepository } from '@/test/helper/authV2TestHelper'

// SupabaseAuthRepositoryをモックして、MockAuthV2Repositoryを使う
vi.mock('@/domain/auth-v2/infrastructure/supabaseAuthRepository', () => ({
  SupabaseAuthRepository: vi.fn(() => mockRepository),
}))

// QueryImplをモック
vi.mock('@/domain/user/infrastructure/queryImpl', () => ({
  default: vi.fn(() => mockQuery),
}))

// CommandImplをモック
vi.mock('@/domain/user/infrastructure/commandImpl', () => ({
  default: vi.fn(() => mockCommand),
}))

// createSupabaseAuthClientはモックして何も返さない（使われないため）
vi.mock('@/infrastructure/supabase', () => ({
  createSupabaseAuthClient: () => ({}),
}))
