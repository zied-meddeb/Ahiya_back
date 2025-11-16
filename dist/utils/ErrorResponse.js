"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceError = void 0;
class ServiceError extends Error {
    statusCode;
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ServiceError';
        Object.setPrototypeOf(this, ServiceError.prototype);
    }
}
exports.ServiceError = ServiceError;
//# sourceMappingURL=ErrorResponse.js.map