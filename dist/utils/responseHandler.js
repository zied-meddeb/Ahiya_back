"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = exports.handleResponse = void 0;
const handleResponse = (res, serviceResponse, successStatus = 200) => {
    if (serviceResponse.success) {
        res.status(serviceResponse.statusCode || successStatus).json({
            success: true,
            message: serviceResponse.message,
            data: serviceResponse.data,
            ...(serviceResponse.count !== undefined && { count: serviceResponse.count })
        });
    }
    else {
        res.status(serviceResponse.statusCode || 500).json({
            success: false,
            message: serviceResponse.message
        });
    }
};
exports.handleResponse = handleResponse;
const handleError = (res, error) => {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred'
    });
};
exports.handleError = handleError;
//# sourceMappingURL=responseHandler.js.map