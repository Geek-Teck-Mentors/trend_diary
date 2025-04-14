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
import { accountSchema } from '@/domain/account/schema';
import getApiClient from '@/infrastructure/api';

export const meta: MetaFunction = () => [{ title: 'アカウント作成 | TrendDiary' }];

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

export default function Signup() {
  const actionData = useActionData<typeof action>();

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-950 p-4'>
      <Card className='flex w-full max-w-md flex-col bg-slate-900 text-slate-50'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold'>アカウント作成</CardTitle>
          <CardDescription className='text-slate-400'>
            以下の情報を入力してアカウントを作成してください
          </CardDescription>
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
                className='border-slate-700 bg-slate-800 text-slate-50'
                aria-invalid={actionData?.errors?.email ? true : undefined}
              />
              {actionData?.errors?.email && (
                <p className='text-sm text-red-500'>{actionData.errors.email.at(0)}</p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>パスワード</Label>
              <Input
                id='password'
                name='password'
                type='password'
                className='border-slate-700 bg-slate-800 text-slate-50'
                aria-invalid={actionData?.errors?.password ? true : undefined}
              />
              {actionData?.errors?.password && (
                <p className='text-sm text-red-500'>{actionData.errors.password.at(0)}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className='flex flex-col gap-4 border-t border-slate-800 pt-6'>
            <Button type='submit' className='w-full bg-slate-50 text-slate-900 hover:bg-slate-200'>
              アカウントを作成
            </Button>
            <Separator className='bg-slate-700' />
            <div className='text-center text-sm text-slate-400'>
              既にアカウントをお持ちですか？{' '}
              <a href='/login' className='text-slate-300 underline hover:text-slate-50'>
                ログイン
              </a>
            </div>
          </CardFooter>
        </Form>
      </Card>
    </div>
  );
}
