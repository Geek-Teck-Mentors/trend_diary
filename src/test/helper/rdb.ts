import getRdbClient, { RdbClient } from '@/infrastructure/rdb'
import TEST_ENV from '@/test/env'

let rdb: RdbClient | null = null

export function getTestRdb(): RdbClient {
  if (!rdb) {
    rdb = getRdbClient(TEST_ENV.DATABASE_URL)
  }
  return rdb
}

export async function disconnectTestRdb(): Promise<void> {
  if (rdb) {
    await rdb.$disconnect()
    rdb = null
  }
}
