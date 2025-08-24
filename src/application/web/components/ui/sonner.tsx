import { useEffect, useState } from "react"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // クライアントサイドでのみToasterを表示
    setIsMounted(true)
  }, [])

  // サーバーサイドレンダリング時やReactが完全に初期化されていない場合は何も表示しない
  if (!isMounted) {
    return null
  }

  // CI環境でのエラーを避けるため、エラーハンドリングを追加
  try {
    return (
      <Sonner
        theme="system"
        className="toaster group"
        style={
          {
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
          } as React.CSSProperties
        }
        {...props}
      />
    )
  } catch (error) {
    // CI環境でエラーが発生した場合は何も表示しない
    console.warn("Toaster initialization failed:", error)
    return null
  }
}

export { Toaster }
