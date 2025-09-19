'use client';

import React from 'react';

interface StaffAvatarDemoProps {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StaffAvatarDemo: React.FC<StaffAvatarDemoProps> = ({
  firstName = 'Hasan',
  lastName = 'Yılmaz',
  avatar,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-xl',
    lg: 'w-20 h-20 text-2xl'
  };

  const getInitials = () => {
    const first = firstName?.trim();
    const last = lastName?.trim();
    
    if (first) {
      return first.charAt(0).toUpperCase();
    } else if (last) {
      return last.charAt(0).toUpperCase();
    } else {
      return 'S'; // Staff fallback
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-sm text-gray-600 mb-2">
        Avatar for: {firstName} {lastName}
      </div>
      
      {avatar ? (
        <img
          src={avatar}
          alt={`${firstName} ${lastName}`}
          className={`${sizeClasses[size]} rounded-full object-cover border-3 border-gray-200 shadow-md`}
        />
      ) : (
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center border-3 border-gray-200 shadow-md`}>
          <span className="text-white font-bold">
            {getInitials()}
          </span>
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        Initial: {getInitials()}
      </div>
    </div>
  );
};

