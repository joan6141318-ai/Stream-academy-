import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-full w-full bg-brand-gray dark:bg-black transition-colors duration-300">
      {/* Content Area */}
      <div className="flex-1 h-full overflow-hidden relative">
        <Outlet />
      </div>
      
      {/* Navigation */}
      <BottomNav />
    </div>
  );
};