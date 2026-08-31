'use client';
import React from 'react';

export const IndiaFlag: React.FC<{ width?: number; height?: number }> = ({ width = 24, height = 16 }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 225 150"
      xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', flexShrink: 0 }}
      aria-label="National Flag of India"
    >
      {/* Top Band: India Saffron */}
      <rect width="225" height="50" fill="#FF9933" />
      {/* Middle Band: White */}
      <rect y="50" width="225" height="50" fill="#FFFFFF" />
      {/* Bottom Band: India Green */}
      <rect y="100" width="225" height="50" fill="#138808" />
      
      {/* Ashoka Chakra: Navy Blue */}
      <g transform="translate(112.5, 75)">
        <circle r="20" fill="none" stroke="#000080" strokeWidth="2.5" />
        <circle r="3.5" fill="#000080" />
        {/* 24 Spokes */}
        {[...Array(24)].map((_, i) => (
          <line
            key={i}
            x1="0"
            y1="0"
            x2="0"
            y2="-20"
            stroke="#000080"
            strokeWidth="1.2"
            transform={`rotate(${i * 15})`}
          />
        ))}
      </g>
    </svg>
  );
};
