import { accountSchema } from '@/domain/account';

export type AuthenticateErrors = {
  email?: string[];
  password?: string[];
};

type ValidationResult =
  | {
      isValid: true;
      data: { email: string; password: string };
    }
  | {
      isValid: false;
      errors: AuthenticateErrors;
    };

export function validateAuthenticateForm(formData: FormData): ValidationResult {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const result = accountSchema.pick({ email: true, password: true }).safeParse({
    email,
    password,
  });

  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  return {
    isValid: true,
    data: { email: result.data.email, password: result.data.password },
  };
}
