import React from 'react';
import { Label } from '@radix-ui/react-label';
import { Separator } from '@radix-ui/react-separator';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';

type Props = {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  errors: Record<string, string[]>;
  isLoading: boolean;
};

export default function SignupPage({ handleSubmit, errors, isLoading }: Props) {
  return (
    <div className='bg-background flex min-h-screen items-center justify-center p-4'>
      <Card className='flex w-full max-w-md flex-col'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold'>アカウント作成</CardTitle>
          <CardDescription>以下の情報を入力してアカウントを作成してください</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} action='/api/account' className='flex flex-1 flex-col'>
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
              {isLoading ? 'アカウント作成中...' : 'アカウントを作成'}
            </Button>
            <Separator />
            <div className='text-muted-foreground text-center text-sm'>
              既にアカウントをお持ちですか？{' '}
              <a href='/login' className='text-primary hover:text-primary/90 underline'>
                ログイン
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
