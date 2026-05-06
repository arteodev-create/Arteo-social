const { AppError } = require('./Errors');

/**
 * Standard Result object for all Use Cases
 * Ensures consistent success/failure handling without relying solely on try-catch for logic.
 */
class Result {
    constructor(isSuccess, error = null, value = null) {
        if (isSuccess && error) {
            throw AppError.internal("InvalidOperation: A result cannot be successful and contain an error");
        }
        if (!isSuccess && !error) {
            throw AppError.internal("InvalidOperation: A failing result must contain an error");
        }

        this.isSuccess = isSuccess;
        this.isFailure = !isSuccess;
        this.error = error;
        this._value = value;
        Object.freeze(this);
    }

    getValue() {
        if (!this.isSuccess) {
            throw AppError.internal("Can't get the value of an error result. Use 'error' instead.");
        }
        return this._value;
    }

    static ok(value) {
        return new Result(true, null, value);
    }

    static fail(error) {
        return new Result(false, error);
    }

    /**
     * Helper for combine multiple results
     * @param {Result[]} results 
     */
    static combine(results) {
        for (const result of results) {
            if (result.isFailure) return result;
        }
        return Result.ok();
    }
}

module.exports = Result;
