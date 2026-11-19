import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SearchModal } from '../common/SearchModal';

interface LayoutProps {
  currentView: string;
  onSelectView: (view: string) => void;
  currentRole: 'SUPER_ADMIN' | 'TEACHER' | 'STUDENT';
  onChangeRole: (role: 'SUPER_ADMIN' | 'TEACHER' | 'STUDENT') => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentView,
  onSelectView,
  currentRole,
  onChangeRole,
  children,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      {/* Sidebar */}
      <Sidebar currentView={currentView} onSelectView={onSelectView} />

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          currentRole={currentRole}
          onChangeRole={onChangeRole}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
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
