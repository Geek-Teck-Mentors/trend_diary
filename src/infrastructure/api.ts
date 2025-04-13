import { hc } from 'hono/client';
import app from '@/application/api/route';

export default function getApiClient() {
  const url = process.env.API_BASE_URL ?? 'http://localhost:5173';
  const apiClient = hc<typeof app>(`${url}/api`);

  return apiClient;
}
