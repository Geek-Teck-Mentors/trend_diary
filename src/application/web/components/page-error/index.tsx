import { FC } from 'react'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { PageErrorType } from './use-page-error'

type Props = {
  pageError: PageErrorType
}

const PageError: FC<Props> = ({ pageError }) => {
  return (
    <Alert variant='destructive'>
      <AlertTitle>{pageError.title}</AlertTitle>
      <AlertDescription>{pageError.description}</AlertDescription>
    </Alert>
  )
}

export default PageError
