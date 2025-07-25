import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  AuthenticateErrors,
  AuthenticateFormData,
  validateAuthenticateForm,
} from "../../features/authenticate/authenticateForm";

type Props = {
  handleSubmit: (data: AuthenticateFormData) => void;
};

export const Form = ({ handleSubmit }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<AuthenticateErrors>({});

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const validation = validateAuthenticateForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsLoading(false);
      return;
    }

    handleSubmit(validation.data);
    setIsLoading(false);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-6">
      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="taro@example.com"
          aria-invalid={errors?.email ? true : undefined}
          disabled={isLoading}
        />
        {errors?.email && (
          <p className="text-destructive text-sm">{errors.email.at(0)}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">パスワード</Label>
        <Input
          id="password"
          name="password"
          type="password"
          aria-invalid={errors?.password ? true : undefined}
          disabled={isLoading}
        />
        {errors?.password && (
          <p className="text-destructive text-sm">{errors.password.at(0)}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "ログイン中..." : "ログイン"}
      </Button>
    </form>
  );
};
