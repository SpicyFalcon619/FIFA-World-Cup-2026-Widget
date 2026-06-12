import React, { useState } from 'react';
import { getPlayerPhoto } from '../../lib/playerAssets';

interface PlayerAvatarProps {
  name: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const first = parts[0].replace('.', '');
  const last = parts[parts.length - 1];
  const firstChar = first ? first[0] : '';
  const lastChar = last ? last[0] : '';
  return (firstChar + lastChar).toUpperCase() || '?';
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const gradients = [
    'from-blue-600 to-indigo-950',
    'from-emerald-600 to-teal-950',
    'from-purple-600 to-fuchsia-950',
    'from-rose-600 to-pink-950',
    'from-amber-600 to-yellow-950',
    'from-cyan-600 to-blue-950',
  ];
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ name, className = '', size = 'md' }) => {
  const photoUrl = getPlayerPhoto(name);
  const [hasError, setHasError] = useState(!photoUrl);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-[12px]',
    md: 'w-10 h-10 text-[14px]',
    lg: 'w-14 h-14 text-[18px]',
  };

  const initials = getInitials(name);
  const gradient = getAvatarColor(name);

  return (
    <div
      className={`relative rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-white/10 shadow-inner ${
        sizeClasses[size]
      } ${className}`}
    >
      {!hasError && photoUrl ? (
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-full object-cover object-top scale-110"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white/95 uppercase`}>
          {initials}
        </div>
      )}
    </div>
  );
};
