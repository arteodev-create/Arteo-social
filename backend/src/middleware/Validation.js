const validation = require('./validation/index');

/**
 * Validation Middleware Facade
 * Redirects to the modular validation subsystem for cleaner architecture.
 */
module.exports = {
    ...validation
};
