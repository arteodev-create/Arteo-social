import { IdentityService } from '@services/identity.service';

export const identityApi = {
  authenticate: IdentityService.authenticate,
  checkIdentifier: IdentityService.checkIdentifier,
  establish: IdentityService.establish,
  verify: IdentityService.verify,
  resendVerification: IdentityService.resendVerification,
  recover: IdentityService.recover,
  completeRecovery: IdentityService.completeRecovery,
  refreshSession: IdentityService.refreshSession,
  getProfile: IdentityService.getProfile,
  updateProfile: IdentityService.updateProfile,
  rotateCredential: IdentityService.rotateCredential,
  getSessions: IdentityService.getSessions,
  getLoginStats: IdentityService.getLoginStats,
  revokeSession: IdentityService.revokeSession,
  logout: IdentityService.logout,
};
