import type { RenderHookResult } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { usePageError } from './use-page-error'

const TEST_ERROR_DATA = {
  STANDARD: { title: 'エラータイトル', description: 'エラー内容' },
  FIRST: { title: 'エラー1', description: '内容1' },
  SECOND: { title: 'エラー2', description: '内容2' },
  DUPLICATE: { title: '同じエラー', description: '同じ内容' },
  EMPTY: { title: '', description: '' },
} as const

type UsePageErrorHook = ReturnType<typeof usePageError>

function setupHook(): RenderHookResult<UsePageErrorHook, unknown> {
  return renderHook(() => usePageError())
}

function setPageError(
  result: RenderHookResult<UsePageErrorHook, unknown>['result'],
  title: string,
  description: string,
): void {
  act(() => {
    result.current.newPageError(title, description)
  })
}

function clearPageError(result: RenderHookResult<UsePageErrorHook, unknown>['result']): void {
  act(() => {
    result.current.clearPageError()
  })
}

function expectPageError(
  result: RenderHookResult<UsePageErrorHook, unknown>['result'],
  expected: { title: string; description: string } | undefined,
): void {
  expect(result.current.pageError).toEqual(expected)
}

describe('usePageError', () => {
  describe('基本動作', () => {
    it('初期状態ではpageErrorがundefinedである', () => {
      const { result } = setupHook()
      expectPageError(result, undefined)
    })

    it('newPageErrorでエラーを設定できる', () => {
      const { result } = setupHook()
      const { title, description } = TEST_ERROR_DATA.STANDARD

      setPageError(result, title, description)
      expectPageError(result, TEST_ERROR_DATA.STANDARD)
    })

    it('clearPageErrorでエラーをクリアできる', () => {
      const { result } = setupHook()
      const { title, description } = TEST_ERROR_DATA.STANDARD

      setPageError(result, title, description)
      clearPageError(result)
      expectPageError(result, undefined)
    })
  })

  describe('エッジケース', () => {
    const testCases = [
      {
        name: '複数回エラーを設定できる',
        actions: [
          { data: TEST_ERROR_DATA.FIRST, expected: TEST_ERROR_DATA.FIRST },
          { data: TEST_ERROR_DATA.SECOND, expected: TEST_ERROR_DATA.SECOND },
        ],
      },
      {
        name: '同じエラーを再設定できる',
        actions: [
          { data: TEST_ERROR_DATA.DUPLICATE, expected: TEST_ERROR_DATA.DUPLICATE },
          { data: TEST_ERROR_DATA.DUPLICATE, expected: TEST_ERROR_DATA.DUPLICATE },
        ],
      },
    ]

    testCases.forEach((testCase) => {
      it(testCase.name, () => {
        const { result } = setupHook()

        testCase.actions.forEach((action) => {
          setPageError(result, action.data.title, action.data.description)
          expectPageError(result, action.expected)
        })
      })
    })

    it('空文字列でもエラーを設定できる', () => {
      const { result } = setupHook()
      const { title, description } = TEST_ERROR_DATA.EMPTY

      setPageError(result, title, description)
      expectPageError(result, TEST_ERROR_DATA.EMPTY)
    })
  })

  describe('境界値テスト', () => {
    it('undefinedを引数に渡した場合の動作', () => {
      const { result } = setupHook()

      act(() => {
        // biome-ignore lint/suspicious/noExplicitAny: undefinedを渡すテストのため
        result.current.newPageError(undefined as any, undefined as any)
      })

      // biome-ignore lint/suspicious/noExplicitAny: undefinedを渡すテストのため
      expectPageError(result, { title: undefined as any, description: undefined as any })
    })
  })
})
