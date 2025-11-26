import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'black';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  icon,
  className = '',
  size = 'md',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold tracking-wide uppercase transition-transform active:scale-[0.97] rounded-sm focus:outline-none";
  
  const sizes = {
    sm: "h-10 text-xs px-4",
    md: "h-12 text-sm px-6",
    lg: "h-14 text-base px-8",
  };

  const variants = {
    primary: "bg-brand-purple text-white hover:opacity-90",
    black: "bg-brand-black text-white hover:bg-brand-dark",
    secondary: "bg-brand-gray text-brand-black hover:bg-gray-200",
    outline: "bg-transparent text-brand-black border-2 border-brand-black hover:bg-gray-50",
    ghost: "bg-transparent text-gray-500 hover:text-brand-black",
  };

  return (
    <button 
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};