'use client';
import React from 'react';

export const StatPathLogo: React.FC<{ size?: number }> = ({ size = 38 }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #0F172A 0%, #003087 100%)',
        border: '1.5px solid #FF9933',
        boxShadow: '0 2px 8px rgba(0, 48, 135, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Subtle Background Grid Accent */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M4 32H36" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M4 24H36" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M4 16H36" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" strokeDasharray="2 2" />
        
        {/* Statistical Growth Bars */}
        <rect x="8" y="22" width="4" height="10" rx="1" fill="#FF9933" />
        <rect x="15" y="16" width="4" height="16" rx="1" fill="#FFFFFF" opacity="0.9" />
        <rect x="22" y="10" width="4" height="22" rx="1" fill="#138808" />
        
        {/* AI Pathway Line & Sparkle Node */}
        <path
          d="M10 21L17 15L24 9L32 14"
          stroke="#F7B801"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="14" r="2.5" fill="#F7B801" />
      </svg>
    </div>
  );
};
