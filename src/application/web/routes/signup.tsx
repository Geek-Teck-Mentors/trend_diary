import React from 'react';
import type { MetaFunction, ActionFunctionArgs } from '@remix-run/cloudflare';
import { Form, useActionData, redirect, json } from '@remix-run/react';
import { Button } from '@/application/web/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/application/web/components/ui/card';
import { Input } from '@/application/web/components/ui/input';
import { Label } from '@/application/web/components/ui/label';
import { Separator } from '@/application/web/components/ui/separator';
import { accountSchema } from '@/domain/account/schema/acountSchema';
import getApiClient from '@/infrastructure/api';

export const meta: MetaFunction = () => [{ title: 'アカウント作成 | TrendDiary' }];

export default function Signup() {
  const actionData = useActionData<typeof action>();

  return (
    <div className='bg-background flex min-h-screen items-center justify-center p-4'>
      <Card className='flex w-full max-w-md flex-col'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold'>アカウント作成</CardTitle>
          <CardDescription>以下の情報を入力してアカウントを作成してください</CardDescription>
        </CardHeader>
        <Form method='post' className='flex flex-1 flex-col'>
          <CardContent className='flex flex-1 flex-col gap-6'>
            <div className='space-y-2'>
              <Label htmlFor='email'>メールアドレス</Label>
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='taro@example.com'
                aria-invalid={actionData?.errors?.email ? true : undefined}
              />
              {actionData?.errors?.email && (
                <p className='text-destructive text-sm'>{actionData.errors.email.at(0)}</p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>パスワード</Label>
              <Input
                id='password'
                name='password'
                type='password'
                aria-invalid={actionData?.errors?.password ? true : undefined}
              />
              {actionData?.errors?.password && (
                <p className='text-destructive text-sm'>{actionData.errors.password.at(0)}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className='flex flex-col gap-4 border-t pt-6'>
            <Button type='submit' className='w-full'>
              アカウントを作成
            </Button>
            <Separator />
            <div className='text-muted-foreground text-center text-sm'>
              既にアカウントをお持ちですか？{' '}
              <a href='/login' className='text-primary hover:text-primary/90 underline'>
                ログイン
              </a>
            </div>
          </CardFooter>
        </Form>
      </Card>
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const result = accountSchema.pick({ email: true, password: true }).safeParse({
    email,
    password,
  });

  if (!result.success) {
    // Response.jsonを使った実装例があまりにも少ないため、deprecatedでも利用する
    return json(
      {
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const client = getApiClient();
    const res = await client.account.$post({
      json: {
        email,
        password,
      },
    });
    if (res.status === 201) return redirect('/login');

    return json(
      {
        errors: {
          email: undefined,
          password: undefined,
        },
      },
      { status: res.status },
    );
  } catch (error) {
    return json(
      {
        errors: {
          email: undefined,
          password: undefined,
        },
      },
      { status: 500 },
    );
  }
}
