import { useNavigate } from "@remix-run/react";
import { useState } from "react";

import getApiClientForClient from "../../infrastructure/api";
import {
  AuthenticateErrors,
  validateAuthenticateForm,
} from "../../features/authenticate/authenticateForm";

export default function useSignup() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<AuthenticateErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

    try {
      const client = getApiClientForClient();

      const res = await client.account.$post({
        json: validation.data,
      });

      if (res.status === 201) {
        navigate("/login");
      } else if (res.status === 409) {
        setErrors({
          email: ["このメールアドレスは既に使用されています"],
        });
      } else {
        setErrors({
          email: ["サインアップに失敗しました"],
        });
      }
    } catch {
      setErrors({
        email: ["ネットワークエラーが発生しました"],
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSubmit, errors, isLoading };
}
