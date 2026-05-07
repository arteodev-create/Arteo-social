const IdentificationRepository = require('../identity/Identification.Repository');
const TransformUtils = require('../../utils/Transform.Utils');
const {
    buildActorUri,
    buildHandle,
    buildInboxUrl,
    buildOutboxUrl,
    isEmail,
    parseHandle,
    resolveOriginForDomain,
} = require('../identity/IdentityHandle');

class FederationService {
    async resolveWebFinger(resource) {
        const raw = String(resource || '').replace(/^acct:/, '');
        const parsed = parseHandle(raw);
        const user = await IdentificationRepository.findByIdentifier(buildHandle(parsed.username, parsed.domain));
        if (!user) return null;

        const actorUrl = user.actorUri || buildActorUri(user.username, user.identityDomain);
        return {
            subject: `acct:${user.username}@${user.identityDomain}`,
            aliases: [actorUrl, buildHandle(user.username, user.identityDomain)],
            links: [
                {
                    rel: 'self',
                    type: 'application/activity+json',
                    href: actorUrl
                },
                {
                    rel: 'http://webfinger.net/rel/profile-page',
                    type: 'text/html',
                    href: actorUrl
                }
            ]
        };
    }

    async resolveActor(identifier, domain) {
        const lookup = isEmail(identifier) ? identifier : buildHandle(parseHandle(identifier, domain).username, parseHandle(identifier, domain).domain);
        const user = await IdentificationRepository.findByIdentifier(lookup);
        if (!user) return null;

        const mapped = TransformUtils.formatUser(user);
        const actorUrl = mapped.actorUri;
        return {
            '@context': [
                'https://www.w3.org/ns/activitystreams',
                'https://w3id.org/security/v1'
            ],
            id: actorUrl,
            type: 'Person',
            preferredUsername: mapped.username,
            name: mapped.fullName || mapped.username,
            summary: mapped.bio || '',
            url: actorUrl,
            inbox: mapped.inboxUrl || buildInboxUrl(mapped.username, mapped.identityDomain),
            outbox: mapped.outboxUrl || buildOutboxUrl(mapped.username, mapped.identityDomain),
            discoverable: true,
            manuallyApprovesFollowers: false,
            icon: mapped.avatar ? { type: 'Image', mediaType: 'image/*', url: mapped.avatar } : undefined,
            arteo: {
                handle: mapped.handle,
                domain: mapped.identityDomain,
                profile: mapped
            }
        };
    }

    emptyOutbox(username, domain) {
        const id = buildOutboxUrl(username, domain);
        return {
            '@context': 'https://www.w3.org/ns/activitystreams',
            id,
            type: 'OrderedCollection',
            totalItems: 0,
            orderedItems: []
        };
    }

    inboxAccepted(username, domain) {
        return {
            accepted: true,
            actor: buildActorUri(username, domain),
            origin: resolveOriginForDomain(domain)
        };
    }
}

module.exports = new FederationService();
