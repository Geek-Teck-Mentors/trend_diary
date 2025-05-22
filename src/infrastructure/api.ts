import { hc } from 'hono/client';
import app from '@/application/api/route';

export default function getApiClient(apiUrl?: string) {
  const url = apiUrl ?? 'http://localhost:5173';
  const apiClient = hc<typeof app>(`${url}/api`);

  return apiClient;
}
