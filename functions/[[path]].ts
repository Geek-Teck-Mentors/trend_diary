import handle from 'hono-remix-adapter/cloudflare-workers'
// @ts-ignore ビルド後に生成されるため
import * as build from '../dist/server'
import hono from '../src/application/server'

// eslint-disable-next-line import/prefer-default-export
export default handle(build, hono)
