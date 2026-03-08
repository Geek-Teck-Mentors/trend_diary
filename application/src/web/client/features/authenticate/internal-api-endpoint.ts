const DEFAULT_DEV_INTERNAL_API_ORIGIN = 'http://localhost:5173'

type InternalApiContext = {
  cloudflare?: {
    env?: {
      INTERNAL_API_ORIGIN?: string
    }
  }
}

export function resolveInternalApiEndpoint(path: string, context: InternalApiContext): URL {
  const configuredOrigin = context.cloudflare?.env?.INTERNAL_API_ORIGIN?.trim()
  if (configuredOrigin) {
    return new URL(path, configuredOrigin)
  }

  if (process.env.NODE_ENV !== 'production') {
    return new URL(path, DEFAULT_DEV_INTERNAL_API_ORIGIN)
  }

  throw new Error('INTERNAL_API_ORIGIN is not configured')
}
