import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
  const [sidebarAbierto, setSidebarAbierto] =
    useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        abierto={sidebarAbierto}
        cerrar={() => setSidebarAbierto(false)}
      />

      <div className="min-h-screen lg:pl-64">
        <Header
          abrirSidebar={() =>
            setSidebarAbierto(true)
          }
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}