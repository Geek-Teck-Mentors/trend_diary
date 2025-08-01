import Footer from '../../components/Footer'
import Header from '../../components/Header'
import PageError from '../../components/PageError'
import { PageErrorType } from '../../components/PageError/usePageError'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { AuthenticateForm } from '../../features/authenticate/AuthenticateForm'
import { AuthenticateFormData } from '../../features/authenticate/validation'

type Props = {
  pageError?: PageErrorType
  handleSubmit: (data: AuthenticateFormData) => Promise<void>
}

export default function SignupPage({ pageError, handleSubmit }: Props) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-white'>
      <Header />
      <div className='flex min-h-[calc(100vh-180px)] items-center justify-center p-4'>
        <Card className='flex w-full max-w-md flex-col'>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-2xl font-bold'>アカウント作成</CardTitle>
            {pageError && <PageError pageError={pageError} />}
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
      <Footer />
    </div>
  )
}
