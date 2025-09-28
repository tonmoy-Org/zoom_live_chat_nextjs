'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function ResponsiveContainer({
  children,
  className,
  maxWidth = 'lg',
  padding = 'md',
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: '',
    sm: 'px-2 sm:px-4',
    md: 'px-4 sm:px-6',
    lg: 'px-6 sm:px-8',
  };

  return (
    <div
      className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}