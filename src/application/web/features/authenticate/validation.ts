import { accountSchema } from '@/domain/account'
import { z } from 'zod'
import { newValidationError, newValidationSuccess, ValidationResult } from '../common/validation'

export type AuthenticateErrors = {
  email?: string[]
  password?: string[]
}

export type AuthenticateFormData = Pick<z.infer<typeof accountSchema>, 'email' | 'password'>

export function validateAuthenticateForm(
  formData: FormData,
): ValidationResult<AuthenticateFormData, AuthenticateErrors> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const result = accountSchema.pick({ email: true, password: true }).safeParse({
    email,
    password,
  })

  if (!result.success) {
    return newValidationError<AuthenticateErrors>(
      result.error.flatten().fieldErrors as AuthenticateErrors,
    )
  }

  return newValidationSuccess<AuthenticateFormData>({
    email: result.data.email,
    password: result.data.password,
  })
}
