import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SearchModal } from '../common/SearchModal';

interface LayoutProps {
  currentView: string;
  onSelectView: (view: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentView,
  onSelectView,
  children,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* 1. Left Sidebar: Rock Solid Fixed / Sticky */}
      <Sidebar currentView={currentView} onSelectView={onSelectView} />

      {/* 2. Right Body: Scrollable independently without moving sidebar */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Header onOpenSearch={() => setIsSearchOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Quick Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={onSelectView}
      />
    </div>
  );
};
