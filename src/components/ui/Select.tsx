'use client';

import { SelectHTMLAttributes, ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
  error?: boolean;
}

export default function Select({ 
  className = '', 
  error = false, 
  children, 
  ...props 
}: SelectProps) {
  const baseClasses = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white';
  const errorClasses = error ? 'border-red-500 bg-red-50' : 'border-gray-300';
  
  return (
    <select
      className={`${baseClasses} ${errorClasses} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
