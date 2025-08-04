import { OffsetPaginationResult } from '@/common/pagination'

export type PolicyResponse = {
  version: number
  content: string
  effectiveAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type PolicyListResponse = OffsetPaginationResult<PolicyResponse>
