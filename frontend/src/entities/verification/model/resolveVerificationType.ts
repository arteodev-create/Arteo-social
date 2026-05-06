import { VerificationType } from './types';

export const resolveVerificationType = (
  isVerified?: boolean,
  verificationType?: VerificationType
): VerificationType | null => {
  if (!isVerified) return null;
  return verificationType || 'blue';
};

