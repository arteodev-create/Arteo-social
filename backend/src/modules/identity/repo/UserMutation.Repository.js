class UserMutationRepository {
    constructor(model, prisma) {
        this.model = model;
        this.prisma = prisma;
    }

    async create(data, select) {
        const { sessionSalt, ...safeData } = data;
        return await this.model.create({ data: safeData, select });
    }

    async update(uuid, data, select) {
        const { sessionSalt, ...safeData } = data;
        return await this.model.update({ where: { uuid }, data: safeData, select });
    }

    async recordHistory(historyItem) {
        return await this.prisma.loginHistory.create({ data: historyItem });
    }

    async revokeSession(sessionId) {
        return await this.prisma.loginHistory.update({ where: { sessionId }, data: { isActive: false } });
    }

    async pruneExpiredSessions(days) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return await this.prisma.loginHistory.deleteMany({
            where: {
                createdAt: { lt: date },
                isActive: false
            }
        });
    }
}

module.exports = UserMutationRepository;
