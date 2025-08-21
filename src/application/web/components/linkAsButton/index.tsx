import { PropsWithChildren } from 'react'
import { Link } from 'react-router'
import { Button } from '../ui/button'

type Props = {
  to: string
  className?: string
  external?: boolean
}

// Linkのperf参考: https://zenn.dev/atusi/articles/3e37d4d54736fa#link
export default function LinkAsButton({
  to,
  children,
  className,
  external,
}: PropsWithChildren<Props>) {
  return (
    <Button variant='link' asChild={true}>
      {external ? (
        <a href={to} className={className} target='_blank' rel='noopener noreferrer'>
          {children}
        </a>
      ) : (
        <Link to={to} className={className}>
          {children}
        </Link>
      )}
    </Button>
  )
}
