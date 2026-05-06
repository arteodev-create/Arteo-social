class CommonTransform {
    formatShortLink(link) {
        if (!link) return null;
        return {
            uuid: link.uuid,
            originalUrl: link.originalUrl,
            shortCode: link.shortCode,
            clickCount: link.clickCount || 0,
            createdAt: link.createdAt
        };
    }

    formatNeuralSignal(signal) {
        if (!signal) return null;
        return {
            uuid: signal.uuid,
            type: signal.type,
            content: signal.content,
            isRead: signal.isRead,
            createdAt: signal.createdAt,
            metadata: signal.metadata
        };
    }
}

module.exports = new CommonTransform();
