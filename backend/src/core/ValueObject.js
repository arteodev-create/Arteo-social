/**
 * Base Value Object class.
 * Value Objects are immutable and equality is based on their properties, not identity.
 * Use this as the base for Email, Password, Username, etc.
 */
class ValueObject {
    constructor(props) {
        this.props = Object.freeze(props);
        Object.freeze(this);
    }

    /**
     * Structural equality — two VOs with the same props are equal.
     * @param {ValueObject} other
     * @returns {boolean}
     */
    equals(other) {
        if (other === null || other === undefined) return false;
        if (other.constructor !== this.constructor) return false;
        return JSON.stringify(this.props) === JSON.stringify(other.props);
    }
}

module.exports = ValueObject;
