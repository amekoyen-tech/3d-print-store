import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'danger' | 'success' | 'warning' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  size = 'sm', 
  rounded = 'sm',
  className,
  ...props 
}) => {
  const variants = {
    default: 'bg-white/10 text-white border-white/20',
    outline: 'bg-transparent text-white border-white/20',
    danger: 'bg-red-500/20 text-red-500 border-red-500/30',
    success: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
    warning: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
    purple: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[8px]',
    md: 'px-2.5 py-1 text-[10px]',
    lg: 'px-3 py-1.5 text-xs',
  };

  const roundedClasses = {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <div 
      className={cn(
        'inline-flex items-center font-black uppercase tracking-widest border',
        variants[variant],
        sizes[size],
        roundedClasses[rounded],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
