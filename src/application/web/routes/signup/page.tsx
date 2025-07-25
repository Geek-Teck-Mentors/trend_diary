import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { AuthenticateFormData } from '../../features/authenticate/validation'
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/alert'
import { AuthenticateForm } from '../../features/authenticate/AuthenticateForm'
import { PageError } from '../../features/common/page'

type Props = {
  pageError?: PageError
  handleSubmit: (data: AuthenticateFormData) => void
}

export default function SignupPage({ pageError, handleSubmit }: Props) {
  return (
    <div className='bg-background flex min-h-screen items-center justify-center p-4'>
      <Card className='flex w-full max-w-md flex-col'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold'>アカウント作成</CardTitle>
          {pageError && (
            <Alert variant='destructive'>
              <AlertTitle>{pageError.title}</AlertTitle>
              <AlertDescription>{pageError.description}</AlertDescription>
            </Alert>
          )}
          <CardDescription>以下の情報を入力してアカウントを作成してください</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthenticateForm
            submitButtonText='アカウント作成'
            loadingSubmitButtonText='アカウント作成中...'
            handleSubmit={handleSubmit}
          />
        </CardContent>
        <CardFooter className='flex flex-col gap-4 border-t pt-6'>
          <div className='text-muted-foreground text-center text-sm'>
            既にアカウントをお持ちですか？{' '}
            <a href='/login' className='text-primary hover:text-primary/90 underline'>
              ログイン
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
