class ServiceError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ServiceError';
    }
}
module.exports = ServiceError;