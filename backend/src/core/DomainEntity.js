/**
 * Base Domain Entity class.
 * Standardizes common entity behaviors like ID mapping and serialization.
 * In a Precise Machine, every domain object should have a predictable structure.
 */
class DomainEntity {
    constructor(props, id = null) {
        this.id = id;
        this.props = Object.freeze(props); // Domain props are immutable after creation
    }

    /**
     * Map a raw database object to a Domain Entity
     * Handles common conversions. BigInt is no longer used for IDs but kept for generic support.
     */
    static mapId(id) {
        if (id === null || id === undefined) return id;
        return typeof id === 'bigint' ? id.toString() : id;
    }

    /**
     * Standard serialization for API responses
     */
    getDTO() {
        return {
            id: this.id,
            ...this.props
        };
    }
}

module.exports = DomainEntity;
