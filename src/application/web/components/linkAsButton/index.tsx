import { PropsWithChildren } from 'react'
import { Link } from 'react-router'
import { Button } from '../ui/button'
import { InternalPath } from '../../routes'

interface BaseProps {
  className?: string
}

interface InternalProps extends BaseProps {
  to: InternalPath
  external?: false
}

interface ExternalProps extends BaseProps {
  to: `https://${string}`
  external: true
}

type Props = InternalProps | ExternalProps

/**
 * LinkAsButton
 * @description 内部リンクの際はReact RouterのLink、外部リンクの際はaタグとして振る舞うボタンコンポーネント
 * @param to InternalPath | `https://${string}`
 * @param external false | true
 * @param className Optional class name for styling
 * @link Linkのperf参考: https://zenn.dev/atusi/articles/3e37d4d54736fa#link
 */
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
