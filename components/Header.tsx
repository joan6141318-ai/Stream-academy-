import React from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  transparent?: boolean;
  actions?: React.ReactNode;
  darkIcon?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBack = false, 
  transparent = false, 
  actions,
  darkIcon = false,
  onBack
}) => {
  const navigate = useNavigate();
  
  const textColor = transparent && !darkIcon 
    ? 'text-white' 
    : 'text-brand-black dark:text-white';
    
  const bgColor = transparent 
    ? 'bg-transparent' 
    : 'bg-brand-gray/90 dark:bg-black/80 backdrop-blur-md border-b border-gray-200/50 dark:border-white/10';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 flex flex-col justify-end pt-safe transition-all duration-300 ${bgColor}`}
      style={{ height: 'calc(3.5rem + env(safe-area-inset-top))' }}
    >
      <div className="flex items-center justify-between px-4 h-14 w-full">
        <div className="flex items-center flex-1 h-full">
          {showBack && (
            <button 
              onClick={handleBack} 
              className={`w-10 h-10 flex items-center justify-center -ml-3 rounded-full active:bg-gray-100 dark:active:bg-white/10 active:opacity-60 transition-all cursor-pointer z-50 ${textColor}`}
              aria-label="Regresar"
            >
              <ArrowLeft size={24} strokeWidth={2} />
            </button>
          )}
          {title && (
            <h1 className={`text-base font-bold uppercase tracking-wider ml-1 truncate ${textColor}`}>
              {title}
            </h1>
          )}
        </div>
        <div className="flex items-center justify-end h-full">
          {actions ? actions : (
            !showBack && (
              <button className={`w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100 dark:active:bg-white/10 active:opacity-60 transition-all ${textColor}`}>
                  <Bell size={22} strokeWidth={2} />
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
};