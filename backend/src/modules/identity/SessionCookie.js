const REFRESH_COOKIE_NAME = 'arteo_refresh';
const REFRESH_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/users/refresh-token',
  maxAge: REFRESH_COOKIE_MAX_AGE_MS
});

const setRefreshCookie = (res, refreshToken) => {
  if (!refreshToken) return;
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getCookieOptions());
};

const clearRefreshCookie = (res) => {
  const { maxAge, ...options } = getCookieOptions();
  res.clearCookie(REFRESH_COOKIE_NAME, options);
};

const readRefreshCookie = (req) => {
  const header = req.headers.cookie;
  if (!header) return null;

  const cookies = header.split(';').reduce((acc, part) => {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (!rawKey) return acc;
    acc[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue.join('='));
    return acc;
  }, {});

  return cookies[REFRESH_COOKIE_NAME] || null;
};

const moveRefreshTokenToCookie = (res, result) => {
  const refreshToken = result?.tokens?.refreshToken;
  setRefreshCookie(res, refreshToken);

  if (!result?.tokens) return result;

  return {
    ...result,
    tokens: {
      accessToken: result.tokens.accessToken
    }
  };
};

module.exports = {
  clearRefreshCookie,
  moveRefreshTokenToCookie,
  readRefreshCookie,
  setRefreshCookie
};
