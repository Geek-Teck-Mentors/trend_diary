import React from 'react';
import { Outlet } from '@remix-run/react';
import AppSidebar from '../components/Sidebar';
import { SidebarProvider } from '../components/ui/sidebar';

// remixではOutletがChildrenの役割を果たす
export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className='w-full'>
        <Outlet />
      </div>
    </SidebarProvider>
  );
}
