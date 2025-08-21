'use client';

import { useState } from 'react';
import { PhoneAuth } from '../components';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <PhoneAuth />
      </div>
    </div>
  );
}