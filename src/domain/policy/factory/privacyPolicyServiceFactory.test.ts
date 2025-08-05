import { beforeEach, describe, expect, it, vi } from 'vitest'
import mockPrisma from '@/test/__mocks__/prisma'
import PrivacyPolicyService from '../service/privacyPolicyService'
import createPrivacyPolicyService from './privacyPolicyServiceFactory'

describe('createPrivacyPolicyService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('プロジェクト標準のmockPrismaでPrivacyPolicyServiceインスタンスを正常に作成する', () => {
    // Act
    const service = createPrivacyPolicyService(mockPrisma)

    // Assert
    expect(service).toBeInstanceOf(PrivacyPolicyService)
    expect(service).toBeDefined()
  })
})
