import { useEffect, useState } from 'react'

/**
 * 指定した遅延時間後に値を更新するカスタムフック
 * 
 * ユーザーの入力などで頻繁に値が変更される場合に、
 * 最後の変更から指定した遅延時間が経過してから値を更新することで、
 * 不要な処理の実行を防ぐことができる。
 * 
 * @template T - debounceする値の型
 * @param value - debounceしたい値
 * @param delay - 遅延時間（ミリ秒）
 * @returns 遅延後に更新される値
 * 
 * @example
 * ```tsx
 * function SearchComponent() {
 *   const [searchTerm, setSearchTerm] = useState('')
 *   const debouncedSearchTerm = useDebounce(searchTerm, 300)
 * 
 *   useEffect(() => {
 *     if (debouncedSearchTerm) {
 *       // 300ms後に検索を実行
 *       performSearch(debouncedSearchTerm)
 *     }
 *   }, [debouncedSearchTerm])
 * 
 *   return (
 *     <input
 *       value={searchTerm}
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *       placeholder="検索..."
 *     />
 *   )
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
