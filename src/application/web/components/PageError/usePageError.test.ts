import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { usePageError } from './usePageError'

describe('usePageError', () => {
  describe('正常系', () => {
    it('初期状態ではpageErrorがundefinedである', () => {
      const { result } = renderHook(() => usePageError())

      expect(result.current.pageError).toBeUndefined()
    })

    it('newPageErrorでエラーを設定できる', () => {
      const { result } = renderHook(() => usePageError())

      act(() => {
        result.current.newPageError('エラータイトル', 'エラー内容')
      })

      expect(result.current.pageError).toEqual({
        title: 'エラータイトル',
        description: 'エラー内容',
      })
    })

    it('clearPageErrorでエラーをクリアできる', () => {
      const { result } = renderHook(() => usePageError())

      // まずエラーを設定
      act(() => {
        result.current.newPageError('エラータイトル', 'エラー内容')
      })

      // エラーをクリア
      act(() => {
        result.current.clearPageError()
      })

      expect(result.current.pageError).toBeUndefined()
    })
  })

  describe('準正常系', () => {
    it('複数回エラーを設定できる', () => {
      const { result } = renderHook(() => usePageError())

      // 最初のエラー設定
      act(() => {
        result.current.newPageError('エラー1', '内容1')
      })

      expect(result.current.pageError).toEqual({
        title: 'エラー1',
        description: '内容1',
      })

      // 2回目のエラー設定
      act(() => {
        result.current.newPageError('エラー2', '内容2')
      })

      expect(result.current.pageError).toEqual({
        title: 'エラー2',
        description: '内容2',
      })
    })

    it('同じエラーを再設定できる', () => {
      const { result } = renderHook(() => usePageError())

      act(() => {
        result.current.newPageError('同じエラー', '同じ内容')
      })

      expect(result.current.pageError).toEqual({
        title: '同じエラー',
        description: '同じ内容',
      })

      act(() => {
        result.current.newPageError('同じエラー', '同じ内容')
      })

      expect(result.current.pageError).toEqual({
        title: '同じエラー',
        description: '同じ内容',
      })
    })

    it('空文字列でもエラーを設定できる', () => {
      const { result } = renderHook(() => usePageError())

      act(() => {
        result.current.newPageError('', '')
      })

      expect(result.current.pageError).toEqual({
        title: '',
        description: '',
      })
    })
  })
})
