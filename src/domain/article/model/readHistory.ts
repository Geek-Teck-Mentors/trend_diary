import { z } from 'zod'
import { readHistorySchema } from '../schema/readHistorySchema'

export type ReadHistory = z.infer<typeof readHistorySchema>
export default ReadHistory
