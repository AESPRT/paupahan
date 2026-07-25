import React from 'react';

interface FullPageLoaderProps {
  message?: string;
}

export default function FullPageLoader({ message = 'Naglo-load...' }: FullPageLoaderProps) {
  return (
    <div className="flex h-screen items-center justify-center bg-paper">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-forest border-t-transparent" />
        <span className="text-xs font-bold text-muted uppercase tracking-wider">{message}</span>
      </div>
    </div>
  );
}