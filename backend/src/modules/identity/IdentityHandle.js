const config = require('../../config/Registry');

const DEFAULT_DOMAIN = (config.infra?.domain || 'arteosocial.com').toLowerCase();

function normalizeDomain(domain) {
    return String(domain || DEFAULT_DOMAIN)
        .trim()
        .replace(/^@+/, '')
        .toLowerCase() || DEFAULT_DOMAIN;
}

function normalizeUsername(username) {
    return String(username || '')
        .trim()
        .replace(/^@+/, '')
        .split('@')[0]
        .toLowerCase();
}

function parseHandle(input, fallbackDomain = DEFAULT_DOMAIN) {
    const raw = String(input || '').trim();
    const withoutPrefix = raw.replace(/^@+/, '');
    const [usernamePart, domainPart] = withoutPrefix.split('@');
    return {
        username: normalizeUsername(usernamePart),
        domain: normalizeDomain(domainPart || fallbackDomain),
    };
}

function buildHandle(username, domain = DEFAULT_DOMAIN) {
    return `@${normalizeUsername(username)}@${normalizeDomain(domain)}`;
}

function resolveOriginForDomain(domain = DEFAULT_DOMAIN) {
    const normalized = normalizeDomain(domain);
    const configured = String(config.infra?.baseUrl || '').replace(/\/+$/, '');
    if (configured && configured.includes(normalized)) return configured;
    return `https://${normalized}`;
}

function buildActorUri(username, domain = DEFAULT_DOMAIN) {
    return `${resolveOriginForDomain(domain)}/users/${normalizeUsername(username)}`;
}

function buildInboxUrl(username, domain = DEFAULT_DOMAIN) {
    return `${buildActorUri(username, domain)}/inbox`;
}

function buildOutboxUrl(username, domain = DEFAULT_DOMAIN) {
    return `${buildActorUri(username, domain)}/outbox`;
}

function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

module.exports = {
    DEFAULT_DOMAIN,
    normalizeDomain,
    normalizeUsername,
    parseHandle,
    buildHandle,
    resolveOriginForDomain,
    buildActorUri,
    buildInboxUrl,
    buildOutboxUrl,
    isEmail,
};
