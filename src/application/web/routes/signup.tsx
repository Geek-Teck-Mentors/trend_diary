import React from 'react';
import type { MetaFunction } from '@remix-run/cloudflare';
import useSignup from '../features/authenticate/useSignup';
import SignupPage from '../features/authenticate/signup.page';

export const meta: MetaFunction = () => [{ title: 'アカウント作成 | TrendDiary' }];

export async function action() {
  return null;
}

export default function Signup() {
  const { handleSubmit, errors, isLoading } = useSignup();

  return <SignupPage handleSubmit={handleSubmit} errors={errors} isLoading={isLoading} />;
}
