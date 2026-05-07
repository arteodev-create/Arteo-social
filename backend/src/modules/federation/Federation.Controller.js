const AsyncHandler = require('../../middleware/AsyncHandler');
const { NotFoundError, BadRequestError } = require('../../core/Errors');
const FederationService = require('./Federation.Service');
const { DEFAULT_DOMAIN, parseHandle } = require('../identity/IdentityHandle');

class FederationController {
    webFinger = AsyncHandler(async (req, res) => {
        const { resource } = req.query;
        if (!resource) throw new BadRequestError('Missing WebFinger resource.');

        const document = await FederationService.resolveWebFinger(resource);
        if (!document) throw new NotFoundError('Federated identity not found.');

        res.type('application/jrd+json').json(document);
    });

    actor = AsyncHandler(async (req, res) => {
        const document = await FederationService.resolveActor(req.params.username, req.query.domain || DEFAULT_DOMAIN);
        if (!document) throw new NotFoundError('Federated actor not found.');

        res.type('application/activity+json').json(document);
    });

    outbox = AsyncHandler(async (req, res) => {
        const parsed = parseHandle(req.params.username, req.query.domain || DEFAULT_DOMAIN);
        res.type('application/activity+json').json(FederationService.emptyOutbox(parsed.username, parsed.domain));
    });

    inbox = AsyncHandler(async (req, res) => {
        const parsed = parseHandle(req.params.username, req.query.domain || DEFAULT_DOMAIN);
        res.status(202).json({
            success: true,
            data: FederationService.inboxAccepted(parsed.username, parsed.domain),
            meta: { message: 'Federated activity accepted.' }
        });
    });
}

module.exports = new FederationController();
