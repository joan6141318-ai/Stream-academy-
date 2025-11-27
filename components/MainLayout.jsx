import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav.jsx';

export const MainLayout = () => {
  return (
    <div className="flex flex-col h-full w-full bg-brand-gray dark:bg-black transition-colors duration-300">
      <div className="flex-1 h-full overflow-hidden relative">
        <Outlet />
      </div>
      
      <BottomNav />
    </div>
  );
};