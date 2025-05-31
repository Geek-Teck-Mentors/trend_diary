import React, { useState } from 'react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { useNavigate } from '@remix-run/react';
import { Button } from '@/application/web/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/application/web/components/ui/card';
import { Input } from '@/application/web/components/ui/input';
import { Label } from '@/application/web/components/ui/label';
import { Separator } from '@/application/web/components/ui/separator';
import { accountSchema } from '@/domain/account';
import { getApiClientForClient } from '@/infrastructure/api';

export const meta: MetaFunction = () => [{ title: 'ログイン | TrendDiary' }];

export async function action() {
  return null;
}

export default function Login() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<{ email?: string[]; password?: string[] }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // バリデーション
    const result = accountSchema.pick({ email: true, password: true }).safeParse({
      email,
      password,
    });

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      const client = getApiClientForClient();

      const res = await client.account.login.$post({
        json: {
          email: result.data.email,
          password: result.data.password,
        },
      });

      if (res.status === 200) {
        // Cookieは自動で設定されるため、リダイレクトのみ
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

  return (
    <div className='bg-background flex min-h-screen items-center justify-center p-4'>
      <Card className='flex w-full max-w-md flex-col'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold'>ログイン</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit} className='flex flex-1 flex-col'>
          <CardContent className='flex flex-1 flex-col gap-6'>
            <div className='space-y-2'>
              <Label htmlFor='email'>メールアドレス</Label>
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='taro@example.com'
                aria-invalid={errors?.email ? true : undefined}
                disabled={isLoading}
              />
              {errors?.email && <p className='text-destructive text-sm'>{errors.email.at(0)}</p>}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>パスワード</Label>
              <Input
                id='password'
                name='password'
                type='password'
                aria-invalid={errors?.password ? true : undefined}
                disabled={isLoading}
              />
              {errors?.password && (
                <p className='text-destructive text-sm'>{errors.password.at(0)}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className='flex flex-col gap-4 border-t pt-6'>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </Button>
            <Separator />
            <div className='text-muted-foreground text-center text-sm'>
              アカウントをお持ちでないですか？{' '}
              <a href='/signup' className='text-primary hover:text-primary/90 underline'>
                アカウント作成
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
