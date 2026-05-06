import React from 'react';
import { VerificationBadge, VerificationType } from '../../verification';

interface VerificationIconProps {
  type?: VerificationType;
  className?: string;
  size?: number;
}

const VerificationIcon: React.FC<VerificationIconProps> = ({ type = 'blue', className = '', size = 20 }) => {
  return <VerificationBadge type={type} className={className} size={size} />;
};

export default VerificationIcon;

