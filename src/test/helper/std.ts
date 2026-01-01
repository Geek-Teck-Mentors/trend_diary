import { VitestUtils } from 'vitest'

export class StdTestHelper {
  static captureStdout = (vi: VitestUtils): { logs: string[]; restore: () => void } => {
    const logs: string[] = []
    const spy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation((chunk, encodingOrCallback, callback) => {
        let encoding: BufferEncoding | undefined
        let cb: ((error?: Error | null) => void) | undefined

        if (typeof encodingOrCallback === 'string') {
          encoding = encodingOrCallback
        }
        if (typeof encodingOrCallback === 'function') {
          cb = encodingOrCallback
        }
        if (typeof callback === 'function') {
          cb = callback
        }

        const logLine =
          typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString(encoding ?? 'utf8')
        logs.push(logLine)

        cb?.()

        return true
      })

    return {
      logs,
      restore: () => spy.mockRestore(),
    }
  }
}
