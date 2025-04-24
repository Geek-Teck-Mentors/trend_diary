import handle from 'hono-remix-adapter/cloudflare-pages';
// @ts-ignore ビルド後に生成されるため
import * as build from '../dist/server';
import hono from '../src/application/server';

// eslint-disable-next-line import/prefer-default-export
export const onRequest = handle(build, hono);
