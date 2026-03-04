let lastGeneratedId = 0n

export function shouldUseExplicitBigIntId(): boolean {
  return process.env.DATABASE_URL?.startsWith('file:') ?? false
}

export function generateBigIntId(): bigint {
  const timeBased = BigInt(Date.now()) * 1_000_000n
  const random = BigInt(Math.floor(Math.random() * 1_000_000))
  const candidate = timeBased + random

  if (candidate <= lastGeneratedId) {
    lastGeneratedId += 1n
    return lastGeneratedId
  }

  lastGeneratedId = candidate
  return candidate
}
