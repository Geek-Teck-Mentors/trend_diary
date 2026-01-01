import { HTTPException } from 'hono/http-exception'
import { describe, expect, it, vi } from 'vitest'

import { LoggerType } from '@/common/logger'

import ClientError from './client-error/client-error'
import handleError from './handle'
import ServerError from './server-error'

type LoggerMock = {
  with: ReturnType<typeof vi.fn>
  debug: ReturnType<typeof vi.fn>
  info: ReturnType<typeof vi.fn>
  warn: ReturnType<typeof vi.fn>
  error: ReturnType<typeof vi.fn>
}

const createLoggerMock = (): LoggerMock => ({
  with: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
})

describe('handleError', () => {
  it('ClientErrorをHTTPExceptionに変換してwarnログを出す', () => {
    const logger = createLoggerMock()
    const error = new ClientError('invalid query', 422)

    const result = handleError(error, logger as unknown as LoggerType)

    expect(result).toBeInstanceOf(HTTPException)
    expect(result.status).toBe(422)
    expect(result.message).toBe('invalid query')
    expect(logger.warn).toHaveBeenCalledTimes(1)
    expect(logger.warn).toHaveBeenCalledWith('client error', error)
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('ServerErrorをHTTPExceptionに変換してerrorログを出す', () => {
    const logger = createLoggerMock()
    const error = new ServerError(new Error('db down'), 503)

    const result = handleError(error, logger as unknown as LoggerType)

    expect(result).toBeInstanceOf(HTTPException)
    expect(result.status).toBe(503)
    expect(result.message).toBe('db down')
    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(logger.error).toHaveBeenCalledWith('internal server error', error)
    expect(logger.warn).not.toHaveBeenCalled()
  })

  it('未知のエラーはHTTPException(500)としてerrorログを出す', () => {
    const logger = createLoggerMock()
    const error = new Error('boom')

    const result = handleError(error, logger as unknown as LoggerType)

    expect(result).toBeInstanceOf(HTTPException)
    expect(result.status).toBe(500)
    expect(result.message).toBe('unknown error')
    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(logger.error).toHaveBeenCalledWith('unknown error', error)
    expect(logger.warn).not.toHaveBeenCalled()
  })
})
