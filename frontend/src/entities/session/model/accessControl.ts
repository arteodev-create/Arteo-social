import { User } from '@entities/user/model';

export type AppRole = 'guest' | 'user' | 'verified_user' | 'moderator' | 'admin';

export type Capability =
  | 'post:create'
  | 'post:delete:any'
  | 'post:report'
  | 'user:follow'
  | 'user:block'
  | 'admin:access'
  | 'profile:edit:self'
  | 'verification:manage';

const ROLE_CAPABILITIES: Record<AppRole, Capability[]> = {
  guest: [],
  user: ['post:create', 'post:report', 'user:follow', 'profile:edit:self'],
  verified_user: ['post:create', 'post:report', 'user:follow', 'profile:edit:self'],
  moderator: ['post:create', 'post:delete:any', 'post:report', 'user:follow', 'user:block', 'profile:edit:self'],
  admin: ['post:create', 'post:delete:any', 'post:report', 'user:follow', 'user:block', 'admin:access', 'profile:edit:self', 'verification:manage']
};

export const resolveUserRole = (user: User | null | undefined): AppRole => {
  if (!user) return 'guest';
  if (user.isAdmin) return 'admin';
  if (user.isVerified) return 'verified_user';
  return 'user';
};

export const hasCapability = (user: User | null | undefined, capability: Capability): boolean => {
  const role = resolveUserRole(user);
  return ROLE_CAPABILITIES[role].includes(capability);
};
