import React from 'react';

interface InitialsAvatarProps {
  name: string | undefined | null;
  className?: string;
}

export default function InitialsAvatar({ name, className = '' }: InitialsAvatarProps) {
  const initial = String(name || '')
    .trim()
    .charAt(0)
    .toUpperCase() || 'J';

  return (
    <div className={`bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold ${className}`}>
      {initial}
    </div>
  );
}


