import React, { useEffect, useState } from 'react';
import { json, Outlet, redirect, useLoaderData } from '@remix-run/react';
import { toast } from 'sonner';
import AppSidebar from '../components/Sidebar';
import { SidebarProvider } from '../components/ui/sidebar';
import getApiClient, { LOCAL_API_URL } from '@/infrastructure/api';

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
  const [displayName, setDisplayName] = useState('未設定');

  useEffect(() => {
    let isMounted = true;
    const client = getApiClient(data.ENV.API_BASE_URL ?? LOCAL_API_URL);

    const f = async () => {
      const res = await client.account.me.$get(
        {},
        { init: { credentials: 'include', mode: 'cors' } },
      );
      if (res.status === 200) {
        const resJson = await res.json();
        setDisplayName(resJson.user?.displayName ?? '未設定');
      } else {
        toast.error('ログインが必要です');
        redirect('/login');
      }
    };

    if (isMounted) {
      f();
    }
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar displayName={displayName} />
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
