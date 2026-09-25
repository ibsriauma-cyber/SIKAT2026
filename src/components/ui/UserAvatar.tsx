import React from 'react';

interface UserAvatarProps {
  src?: string;
  name?: string;
  className?: string;
}

export function UserAvatar({ className = "" }: UserAvatarProps) {
  return (
    <div className={`flex items-center justify-center bg-gradient-to-b from-[#01ccff] to-[#007bfc] text-white overflow-hidden ${className}`}>
      {/* SVG for the exact user silhouette from the image provided */}
      <svg viewBox="0 0 100 100" className="w-full h-full transform translate-y-1" fill="currentColor">
        <circle cx="50" cy="35" r="20" />
        <path d="M10,95 C10,70 30,58 50,58 C70,58 90,70 90,95 Z" />
      </svg>
    </div>
  );
}
