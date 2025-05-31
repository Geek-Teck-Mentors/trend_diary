import { useState } from 'react';
import { useNavigate } from '@remix-run/react';
import getApiClient from '@/infrastructure/api';
import { Errors, validateForm } from './validation';

export default function useLogin() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const validation = validateForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsLoading(false);
      return;
    }

    try {
      const currentOrigin = `${window.location.protocol}//${window.location.host}`;
      const client = getApiClient(currentOrigin);

      const res = await client.account.login.$post({
        json: { email: validation.data?.email, password: validation.data?.password },
      });

      if (res.status === 200) {
        navigate('/trends');
      } else if (res.status === 401 || res.status === 404) {
        setErrors({
          email: ['メールアドレスまたはパスワードが正しくありません。'],
        });
      } else {
        setErrors({
          email: ['ログインに失敗しました。'],
        });
      }
    } catch (error) {
      setErrors({
        email: ['ネットワークエラーが発生しました'],
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSubmit, errors, isLoading };
}
