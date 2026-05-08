import { describe, expect, it } from 'vitest'
import { getApiErrorMessage } from './error'

describe('getApiErrorMessage', () => {
  it('Errorインスタンスのmessageを返す', () => {
    const error = new Error('API呼び出しに失敗しました')
    expect(getApiErrorMessage(error, 'デフォルト')).toBe('API呼び出しに失敗しました')
  })

  it('messageプロパティを持つオブジェクトのmessageを返す', () => {
    const error = { message: 'カスタムエラーメッセージ' }
    expect(getApiErrorMessage(error, 'デフォルト')).toBe('カスタムエラーメッセージ')
  })

  it('messageプロパティの値がundefinedの場合はデフォルトメッセージを返す', () => {
    const error = { message: undefined }
    expect(getApiErrorMessage(error, 'デフォルトメッセージ')).toBe('デフォルトメッセージ')
  })

  it('messageプロパティの値がnullの場合はデフォルトメッセージを返す', () => {
    const error = { message: null }
    expect(getApiErrorMessage(error, 'デフォルトメッセージ')).toBe('デフォルトメッセージ')
  })

  it('messageプロパティを持たないオブジェクトの場合はデフォルトメッセージを返す', () => {
    const error = { code: 'UNKNOWN' }
    expect(getApiErrorMessage(error, 'デフォルトメッセージ')).toBe('デフォルトメッセージ')
  })

  it('errorが配列の場合はデフォルトメッセージを返す', () => {
    expect(getApiErrorMessage([], 'デフォルトメッセージ')).toBe('デフォルトメッセージ')
  })

  it('errorがnullの場合はデフォルトメッセージを返す', () => {
    expect(getApiErrorMessage(null, 'デフォルトメッセージ')).toBe('デフォルトメッセージ')
  })

  it('errorがundefinedの場合はデフォルトメッセージを返す', () => {
    expect(getApiErrorMessage(undefined, 'デフォルトメッセージ')).toBe('デフォルトメッセージ')
  })

  it('errorがプリミティブ値（文字列）の場合はデフォルトメッセージを返す', () => {
    expect(getApiErrorMessage('文字列エラー', 'デフォルトメッセージ')).toBe('デフォルトメッセージ')
  })

  it('errorがプリミティブ値（数値）の場合はデフォルトメッセージを返す', () => {
    expect(getApiErrorMessage(42, 'デフォルトメッセージ')).toBe('デフォルトメッセージ')
  })
})
