import React from 'react';
import { resolveVerificationType } from '../model/resolveVerificationType';
import { VerificationType } from '../model/types';

interface VerificationBadgeProps {
  isVerified?: boolean;
  verificationType?: VerificationType;
  type?: VerificationType;
  className?: string;
  size?: number;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  isVerified = true,
  verificationType,
  type,
  className = '',
  size = 20
}) => {
  const effectiveType = type || resolveVerificationType(isVerified, verificationType);
  if (!effectiveType) return null;

  const renderSeal = (primaryColor: string, secondaryColor: string) => (
    <svg
      className={`${className} drop-shadow-sm`}
      style={{ width: size, height: size }}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`grad-${effectiveType}-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>
      </defs>
      <path
        d="M12 2L14.85 4.85L18.85 4.35L19.35 8.35L22.2 11.2L19.35 14.05L18.85 18.05L14.85 17.55L12 20.4L9.15 17.55L5.15 18.05L4.65 14.05L1.8 11.2L4.65 8.35L5.15 4.35L9.15 4.85L12 2Z"
        fill={`url(#grad-${effectiveType}-${size})`}
      />
      <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  switch (effectiveType) {
    case 'registry':
      return (
        <svg
          className={`${className} drop-shadow-sm`}
          style={{ width: size, height: size }}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" strokeDasharray="1 2" className="opacity-40" />
          <path d="M12 7V17M7 12H17" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="opacity-60" />
          <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
    case 'gold':
      return renderSeal('#FFD700', '#FFA500');
    case 'white':
      return renderSeal('#F4F4F5', '#E4E4E7');
    case 'blue':
    default:
      return renderSeal('#1D9BF0', '#0070BA');
  }
};

export default VerificationBadge;

