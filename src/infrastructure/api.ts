import { hc } from 'hono/client';
import app from '@/application/api/route';

const FOR_CLIENT_API_URL = `${window.location.protocol}//${window.location.host}`;

export const getApiClientForClient = () => hc<typeof app>(FOR_CLIENT_API_URL);

// クライアント呼び出しの場合はapiUrlが必須
export const getApiClient = (url: string) => hc<typeof app>(`${url}/api`);
export default getApiClient;
