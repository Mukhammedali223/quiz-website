/**
 * Joi Validation Middleware Factory
 * Creates middleware that validates request data against a Joi schema
 * 
 * SECURITY HARDENING:
 * - stripUnknown: removes fields not defined in schema
 * - abortEarly: false - returns ALL validation errors
 * - convert: true - allows Joi to apply transformations (.trim(), .lowercase())
 * - Explicit null/undefined body rejection
 * - All errors return HTTP 400
 */

/**
 * Common validation options for all validators
 */
const validationOptions = {
    abortEarly: false,      // Return all errors, not just the first
    stripUnknown: true,     // Remove unknown fields (security)
    convert: true,          // Allow Joi to apply .trim(), .lowercase(), etc.
};

/**
 * Format Joi validation errors into consistent response format
 * @param {Object} error - Joi validation error object
 * @returns {Array} Formatted error details
 */
const formatValidationErrors = (error) => {
    return error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
        type: detail.type
    }));
};

/**
 * Validate request body
 * @param {Object} schema - Joi validation schema
 */
export const validateBody = (schema) => {
    return (req, res, next) => {
        // Reject null or undefined body explicitly
        if (req.body === null || req.body === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: [{
                    field: 'body',
                    message: 'Request body is required',
                    type: 'any.required'
                }]
            });
        }

        // Reject non-object bodies (arrays, primitives)
        if (typeof req.body !== 'object' || Array.isArray(req.body)) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: [{
                    field: 'body',
                    message: 'Request body must be a JSON object',
                    type: 'object.base'
                }]
            });
        }

        const { error, value } = schema.validate(req.body, validationOptions);

        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: formatValidationErrors(error)
            });
        }

        // Replace body with validated and sanitized value
        req.body = value;
        next();
    };
};

/**
 * Validate request params
 * @param {Object} schema - Joi validation schema
 */
export const validateParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            ...validationOptions,
            stripUnknown: false // Don't strip params, they come from route
        });

        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Invalid parameters',
                details: formatValidationErrors(error)
            });
        }

        // Replace params with validated value
        req.params = value;
        next();
    };
};

/**
 * Validate request query
 * @param {Object} schema - Joi validation schema
 */
export const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, validationOptions);

        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Invalid query parameters',
                details: formatValidationErrors(error)
            });
        }

        // Replace query with validated value
        req.query = value;
        next();
    };
};
