import React from 'react';
import { json, Outlet, useLoaderData } from '@remix-run/react';
import AppSidebar from '../components/Sidebar';
import { SidebarProvider } from '../components/ui/sidebar';

export async function loader() {
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
