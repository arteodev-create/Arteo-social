const config = require('./Registry');

/**
 * JWT Configuration Orchestrator
 * Strictly utilizes the Arteo Registry for secrets.
 */
const getAccessTokenSecret = () => config.security.jwtAccessSecret;
const getRefreshTokenSecret = () => config.security.jwtRefreshSecret;

module.exports = {
  getAccessTokenSecret,
  getRefreshTokenSecret
};

