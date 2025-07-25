export type ValidationResult<T, E extends Record<string, any>> =
  | {
      isValid: true
      data: T
    }
  | {
      isValid: false
      errors: E
    }

export function newValidationSuccess<T>(data: T): ValidationResult<T, never> {
  return {
    isValid: true,
    data,
  }
}

export function newValidationError<E extends Record<string, any>>(
  errors: E,
): ValidationResult<never, E> {
  return {
    isValid: false,
    errors,
  }
}
