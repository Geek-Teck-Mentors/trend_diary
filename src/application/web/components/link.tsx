import { PropsWithChildren } from 'react'
import { Link } from 'react-router'
import { InternalPath } from '../routes'
import { Button } from './ui/button'

interface BaseProps {
  className?: string
}

type ExternalPath = `https://${string}`

interface ExternalLinkProps extends BaseProps {
  to: ExternalPath
}

function ExternalLink({ to, children, className }: PropsWithChildren<ExternalLinkProps>) {
  return (
    <a href={to} className={className} target='_blank' rel='noopener noreferrer'>
      {children}
    </a>
  )
}

type LinkAsButtonProps =
  | (BaseProps & {
      to: InternalPath
      external?: false
    })
  | (ExternalLinkProps & {
      external: true
    })

/**
 * LinkAsButton
 * @description 内部リンクの際はReact RouterのLink、外部リンクの際はaタグとして振る舞うボタンコンポーネント
 * @param to InternalPath | `https://${string}`
 * @param external false | true
 * @param className Optional class name for styling
 * @link Linkのperf参考: https://zenn.dev/atusi/articles/3e37d4d54736fa#link
 */
export function LinkAsButton({
  to,
  children,
  className,
  external,
}: PropsWithChildren<LinkAsButtonProps>) {
  return (
    <Button variant='link' asChild={true}>
      {external ? (
        <ExternalLink to={to} className={className}>
          {children}
        </ExternalLink>
      ) : (
        <Link to={to} className={className}>
          {children}
        </Link>
      )}
    </Button>
  )
}

export function AnchorLink({
  to,
  children,
  className,
  external,
}: PropsWithChildren<LinkAsButtonProps>) {
  return external ? (
    <ExternalLink to={to} className={className}>
      {children}
    </ExternalLink>
  ) : (
    <a href={to} className={className}>
      {children}
    </a>
  )
}
