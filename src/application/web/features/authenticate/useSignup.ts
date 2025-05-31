import { useState } from 'react';
import { useNavigate } from '@remix-run/react';
import getApiClient from '@/infrastructure/api';
import { Errors, validateForm } from './validation';

export default function useSignup() {
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

      const res = await client.account.$post({
        json: validation.data,
      });

      if (res.status === 201) {
        navigate('/login');
      } else if (res.status === 409) {
        setErrors({
          email: ['このメールアドレスは既に使用されています'],
        });
      } else {
        setErrors({
          email: ['サインアップに失敗しました'],
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
