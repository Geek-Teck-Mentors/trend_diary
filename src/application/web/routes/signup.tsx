import React from 'react';
import type { MetaFunction } from '@remix-run/cloudflare';
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

export const meta: MetaFunction = () => [{ title: 'アカウント登録 | マイアプリ' }];

export default function Signup() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-950 p-4'>
      <Card className='w-full max-w-md bg-slate-900 text-slate-50'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold'>アカウント作成</CardTitle>
          <CardDescription className='text-slate-400'>
            以下の情報を入力してアカウントを作成してください
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>お名前</Label>
            <Input
              id='name'
              placeholder='山田 太郎'
              className='border-slate-700 bg-slate-800 text-slate-50'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='email'>メールアドレス</Label>
            <Input
              id='email'
              type='email'
              placeholder='taro@example.com'
              className='border-slate-700 bg-slate-800 text-slate-50'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='password'>パスワード</Label>
            <Input
              id='password'
              type='password'
              className='border-slate-700 bg-slate-800 text-slate-50'
            />
          </div>
        </CardContent>
        <CardFooter className='flex flex-col space-y-4'>
          <Button className='w-full bg-slate-50 text-slate-900 hover:bg-slate-200'>
            アカウントを作成
          </Button>
          <Separator className='bg-slate-700' />
          <div className='text-center text-sm text-slate-400'>
            すでにアカウントをお持ちですか？{' '}
            <a href='/login' className='text-slate-300 underline hover:text-slate-50'>
              ログイン
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
