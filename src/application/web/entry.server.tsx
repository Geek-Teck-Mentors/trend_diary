/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to,
 * but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import type {
  ActionFunctionArgs,
  AppLoadContext,
  EntryContext,
  LoaderFunctionArgs,
} from '@remix-run/cloudflare'
import { isRouteErrorResponse, RemixServer } from '@remix-run/react'
import { renderToReadableStream } from 'react-dom/server'

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  // This is ignored so we can keep it in the template for visibility.  Feel
  // free to delete this parameter in your app if you're not using it!
  loadContext: AppLoadContext,
) {
  let statusCode = responseStatusCode
  const body = await renderToReadableStream(
    <RemixServer context={remixContext} url={request.url} />,
    {
      signal: request.signal,
      onError(error: unknown) {
        // Log streaming rendering errors from inside the shell
        // biome-ignore lint/suspicious/noConsole: Remixのエラーを一応出す
        console.error(error)
        statusCode = 500
      },
    },
  )

  responseHeaders.set('Content-Type', 'text/html; charset=utf-8')
  return new Response(body, {
    headers: responseHeaders,
    status: statusCode,
  })
}

// 404エラー, abortされたリクエストの場合は不要なのでログ出力しない
// 参考: https://zenn.dev/mkizka/articles/0db9bc30e1f707#(1)-error%3A-no-route-matches-url-%22%2Ffoo%22
export function handleError(error: unknown, { request }: LoaderFunctionArgs | ActionFunctionArgs) {
  if ((isRouteErrorResponse(error) && error.status === 404) || request.signal.aborted) {
    return
  }
}
