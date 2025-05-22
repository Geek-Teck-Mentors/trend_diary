import React from 'react';
import { json, Outlet, redirect, useLoaderData } from '@remix-run/react';
import AppSidebar from '../components/Sidebar';
import { SidebarProvider } from '../components/ui/sidebar';
import getApiClient from '@/infrastructure/api';

export async function loader() {
  const client = getApiClient(process.env.API_BASE_URL);
  const res = await client.account.me.$get();

  if (res.status >= 400 && res.status < 500) {
    return redirect('/login');
  }

  return json({
    ENV: {
      API_BASE_URL: process.env.API_BASE_URL,
    },
  });
}

// remixではOutletがChildrenの役割を果たす
export default function Layout() {
  const data = useLoaderData<typeof loader>();

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className='w-full'>
        <Outlet />
        <script
          // https://remix.run/docs/en/main/guides/envvars
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
      </div>
    </SidebarProvider>
  );
}
