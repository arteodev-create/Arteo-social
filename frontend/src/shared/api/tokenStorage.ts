const REFRESH_TOKEN_KEY = 'refreshToken';

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
let accessTokenMemory: string | null = null;

export const tokenStorage = {
  getAccessToken: () => accessTokenMemory,
  getRefreshToken: () => (canUseStorage() ? window.localStorage.getItem(REFRESH_TOKEN_KEY) : null),
  setTokens: (accessToken?: string | null, refreshToken?: string | null) => {
    if (accessToken) accessTokenMemory = accessToken;
    if (!canUseStorage()) return;
    if (refreshToken) window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    window.localStorage.removeItem('token');
  },
  clear: () => {
    accessTokenMemory = null;
    if (!canUseStorage()) return;
    window.localStorage.removeItem('token');
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
