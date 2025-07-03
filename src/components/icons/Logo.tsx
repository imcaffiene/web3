import React from 'react';

interface CoinIconProps {
  className?: string; // Optional className prop
}

const CoinIcon: React.FC<CoinIconProps> = ({ className }) => (
  <svg
    className={`${className || ''} inline-block`}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1" />
    <path
      d="M12 6V3M12 21V18M18 12H21M3 12H6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <text
      x="12"
      y="14"
      textAnchor="middle"
      fill="currentColor"
      fontSize="6"
      fontFamily="Arial, sans-serif"
      fontWeight="bold"
    >
      8
    </text>
  </svg>
);

export default CoinIcon;