'use client';
import React from 'react';

export const StatPathLogo: React.FC<{ size?: number }> = ({ size = 38 }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #003087 100%)',
        border: '1.5px solid #60A5FA',
        boxShadow: '0 4px 12px rgba(30, 58, 138, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Universal Neural Skill Compass Ring */}
        <circle cx="20" cy="20" r="14" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" strokeDasharray="3 2" />
        <circle cx="20" cy="20" r="8" stroke="rgba(96, 165, 250, 0.4)" strokeWidth="1" />
        
        {/* Universal Competency Diamond Nodes */}
        <path d="M20 7L24 16L33 20L24 24L20 33L16 24L7 20L16 16L20 7Z" fill="url(#sparkleGrad)" opacity="0.95" />
        
        {/* Central Core Element */}
        <circle cx="20" cy="20" r="3.5" fill="#FF9933" />
        <circle cx="20" cy="20" r="1.5" fill="#FFFFFF" />
        
        <defs>
          <linearGradient id="sparkleGrad" x1="7" y1="7" x2="33" y2="33" gradientUnits="userSpaceOnUse">
            <stop stopColor="#60A5FA" />
            <stop offset="0.5" stopColor="#3B82F6" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export const SkillPathLogo = StatPathLogo;
