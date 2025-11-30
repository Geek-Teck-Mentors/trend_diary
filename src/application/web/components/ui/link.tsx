import { PropsWithChildren } from 'react'
import { Link } from 'react-router'
import { InternalPath } from '../../routes'
import { Button } from '../shadcn/button'

interface BaseProps {
  className?: string
  onClick?: () => void
}

export type ExternalPath = `https://${string}`

interface ExternalLinkProps extends BaseProps {
  to: ExternalPath
}

function ExternalLink({ to, children, className, onClick }: PropsWithChildren<ExternalLinkProps>) {
  return (
    // biome-ignore lint: plugin
    <a
      href={to}
      className={className}
      onClick={onClick}
      target='_blank'
      rel='noopener noreferrer nofollow'
    >
      {children}
    </a>
  )
}

interface InternalLinkProps extends BaseProps {
  to: InternalPath
}

function InternalLink({ to, children, className, onClick }: PropsWithChildren<InternalLinkProps>) {
  return (
    <Link to={to} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}

function isExternalPath(to: string): to is ExternalPath {
  return /^https:\/\//.test(to)
}

type AnchorLinkProps = PropsWithChildren<{
  to: InternalPath | ExternalPath
  className?: string
  onClick?: () => void
}>

/**
 * AnchorLink
 * @description aタグを薄くラップしたコンポーネント。内部リンクの際はReact RouterのLink
 * @param to InternalPath | `https://${string}`, InternalPathはルーティング定義から型推論される
 * @param className
 * @param onClick
 * @param children
 * @link Linkのperf参考: https://zenn.dev/atusi/articles/3e37d4d54736fa#link
 */
export function AnchorLink({ to, className, onClick, children }: AnchorLinkProps) {
  return isExternalPath(to) ? (
    <ExternalLink to={to} className={className} onClick={onClick}>
      {children}
    </ExternalLink>
  ) : (
    <InternalLink to={to} className={className} onClick={onClick}>
      {children}
    </InternalLink>
  )
}

type LinkAsButtonProps = AnchorLinkProps

/**
 * LinkAsButton
 * @description 内部リンクの際はReact RouterのLink、外部リンクの際はaタグとして振る舞うボタンコンポーネント
 * @param to InternalPath | `https://${string}`
 * @param className Optional class name for styling
 */
export function LinkAsButton({ to, className, children }: LinkAsButtonProps) {
  return (
    <Button variant='link' asChild={true}>
      <AnchorLink to={to} className={className}>
        {children}
      </AnchorLink>
    </Button>
  )
}
