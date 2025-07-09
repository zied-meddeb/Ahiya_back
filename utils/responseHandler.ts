import { Response } from 'express';

interface ServiceResponse {
    success: boolean;
    statusCode?: number;
    message?: string;
    data?: any;
    count?: number;
}

interface ServiceError  {
    statusCode?: number;
    message?: string;
}

export const handleResponse = (
    res: Response,
    serviceResponse: ServiceResponse,
    successStatus: number = 200
) => {
    if (serviceResponse.success) {
        res.status(serviceResponse.statusCode || successStatus).json({
            success: true,
            message: serviceResponse.message,
            data: serviceResponse.data,
            ...(serviceResponse.count !== undefined && { count: serviceResponse.count })
        });
    } else {
        res.status(serviceResponse.statusCode || 500).json({
            success: false,
            message: serviceResponse.message
        });
    }
};

export const handleError = (res: Response, error: ServiceError) => {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred'
        });
};