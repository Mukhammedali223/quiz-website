/**
 * Custom Application Error Class
 * Used to throw errors with specific HTTP status codes
 */
export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Global Error Handler Middleware
 * Handles all errors and sends appropriate responses
 */
export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Log error for debugging (in production, use proper logging)
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const messages = Object.values(err.errors).map(e => e.message);
        message = messages.join('. ');
    }

    // Mongoose CastError (Invalid ObjectId)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 400;
        message = 'Invalid ID format.';
    }

    // Mongoose Duplicate Key Error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token.';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired.';
    }

    // Joi Validation Error
    if (err.isJoi) {
        statusCode = 400;
        message = err.details.map(d => d.message).join('. ');
    }

    // Handle API requests
    if (req.originalUrl.startsWith('/api') || req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(statusCode).json({
            success: false,
            error: message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }

    // Handle page requests (render error page)
    res.status(statusCode).render('error', {
        title: 'Error',
        statusCode,
        message,
        layout: 'layouts/main'
    });
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
