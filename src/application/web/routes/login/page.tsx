import Footer from '../../components/Footer'
import Header from '../../components/Header'
import PageError from '../../components/PageError'
import { PageErrorType } from '../../components/PageError/usePageError'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { AuthenticateForm } from '../../features/authenticate/AuthenticateForm'
import { AuthenticateFormData } from '../../features/authenticate/validation'

type Props = {
  pageError?: PageErrorType
  handleSubmit: (data: AuthenticateFormData) => Promise<void>
}

export default function LoginPage({ handleSubmit, pageError }: Props) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-white'>
      <Header />
      <div className='flex min-h-[calc(100vh-180px)] items-center justify-center p-4'>
        <Card className='flex w-full max-w-md flex-col'>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-2xl font-bold'>ログイン</CardTitle>
            {pageError && <PageError pageError={pageError} />}
          </CardHeader>
          <CardContent>
            <AuthenticateForm
              submitButtonText='ログイン'
              loadingSubmitButtonText='ログイン中...'
              handleSubmit={handleSubmit}
            />
          </CardContent>
          <CardFooter className='flex flex-col gap-4 border-t pt-6'>
            <div className='text-muted-foreground text-center text-sm'>
              アカウントをお持ちでないですか？{' '}
              <a href='/signup' className='text-primary hover:text-primary/90 underline'>
                アカウント作成
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
