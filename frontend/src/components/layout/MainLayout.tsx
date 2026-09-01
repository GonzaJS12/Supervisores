import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
  const [sidebarAbierto, setSidebarAbierto] =
    useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar
        abierto={sidebarAbierto}
        cerrar={() => setSidebarAbierto(false)}
      />

      <div className="lg:pl-64">
        <Header
          abrirSidebar={() =>
            setSidebarAbierto(true)
          }
        />

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}