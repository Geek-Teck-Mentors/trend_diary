export type Result<T, E extends Error> = { data: T } | { error: E }
export type AsyncResult<T, E extends Error> = Promise<Result<T, E>>

export function resultSuccess<T>(value: T): Result<T, never> {
  return { data: value } as Result<T, never>
}

export function resultError<T, E extends Error>(value: E): Result<T, E> {
  return { error: value } as Result<T, E>
}

export function isSuccess<T, E extends Error>(result: Result<T, E>): result is { data: T } {
  return 'data' in result
}

export function isError<T, E extends Error>(result: Result<T, E>): result is { error: E } {
  return 'error' in result
}
