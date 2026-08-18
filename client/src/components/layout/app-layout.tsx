import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from './app-footer.tsx';
import Header from './app-header.tsx';
import Sidebar from './sidebar.tsx';

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const pageKey = location.pathname.split('/').slice(0, 4).join('/');

  return (
    <div className="app-shell flex h-svh overflow-hidden">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header onMenu={() => setOpen(true)} />
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 px-md py-lg md:px-xl md:py-xl">
            <div key={pageKey} className="page-enter">
              <Outlet />
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
