import React from 'react';
import { Capability, hasCapability } from '@entities/session/model/accessControl';
import { useAuthStore } from '@entities/session/model';

interface CapabilityGuardProps {
  capability: Capability;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const CapabilityGuard: React.FC<CapabilityGuardProps> = ({ capability, fallback = null, children }) => {
  const { user } = useAuthStore();
  if (!hasCapability(user, capability)) return <>{fallback}</>;
  return <>{children}</>;
};

export default CapabilityGuard;

