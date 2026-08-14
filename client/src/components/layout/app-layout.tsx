import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './app-footer.tsx';
import Header from './app-header.tsx';
import Sidebar from './sidebar.tsx';

export default function AppLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <Header onMenu={() => setOpen(true)} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-md py-xl md:px-xl">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
