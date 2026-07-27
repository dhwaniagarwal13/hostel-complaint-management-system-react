import React from 'react';
import Sidebar from '../components/layout/Sidebar';

export default function PortalLayout({ children, menuItems, roleName }) {
  return (
    <div className="min-h-screen bg-surface flex selection:bg-primary/10 selection:text-primary">
      <Sidebar menuItems={menuItems} roleName={roleName} />
      
      <main className="flex-1 md:ml-72 min-h-screen pb-24 md:pb-12 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-6 py-8 md:px-12 md:py-16">
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {children}
          </div>
        </div>
      </main>
      
      {/* Background decoration for the whole portal */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03] dark:opacity-[0.05]">
        <div className="absolute top-0 left-0 w-full h-full mesh-gradient" />
      </div>
    </div>
  );
}
