import React from 'react';
import type { MetaFunction } from '@remix-run/cloudflare';
import SignupPage from './signup.page';
import useSignup from './useSignup';

export const meta: MetaFunction = () => [{ title: 'アカウント作成 | TrendDiary' }];

export default function Signup() {
  const { handleSubmit, errors, isLoading } = useSignup();

  return <SignupPage handleSubmit={handleSubmit} errors={errors} isLoading={isLoading} />;
}
