/**
 * TransformUtils Facade
 * Orchestrates entity data projection (DTO) for platform-wide API consistency.
 */
module.exports = {
    // Lazy accessors to prevent circular dependency issues during module initialization
    get _user() { return require('./transform/User.Transform'); },
    get _post() { return require('./transform/Post.Transform'); },
    get _plugin() { return require('./transform/Plugin.Transform'); },
    get _common() { return require('./transform/Common.Transform'); },

    // User & Identity
    formatUser: function(u, s) { return this._user.formatUser(u, s); },
    formatSession: function(s) { return this._user.formatSession(s); },
    
    // Plugins & Extensions
    formatPlugin: function(p) { return this._plugin.formatPlugin(p); },
    formatCategory: function(c) { return this._plugin.formatCategory(c); },
    
    // Posts & Social
    formatPost: function(p, c) { return this._post.formatPost(p, c); },
    formatAlgorithm: function(a) { return this._post.formatAlgorithm(a); },
    formatHashtag: function(h) { return this._post.formatHashtag(h); },
    
    // Utilities
    formatShortLink: function(l) { return this._common.formatShortLink(l); }
};
