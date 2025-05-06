import React from 'react';

import { SidebarProvider } from '../components/ui/sidebar';
import AppSidebar from '../components/Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className='w-full'>
      <AppSidebar />
      {children}
    </SidebarProvider>
  );
}
