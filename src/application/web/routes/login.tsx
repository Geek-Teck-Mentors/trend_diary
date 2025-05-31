import React from 'react';
import type { MetaFunction } from '@remix-run/cloudflare';
import useLogin from '../features/authenticate/useLogin';
import LoginPage from '../features/authenticate/login.page';

export const meta: MetaFunction = () => [{ title: 'ログイン | TrendDiary' }];

export async function action() {
  return null;
}

export default function Login() {
  const { handleSubmit, errors, isLoading } = useLogin();

  return <LoginPage handleSubmit={handleSubmit} errors={errors} isLoading={isLoading} />;
}
