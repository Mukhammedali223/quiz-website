/**
 * Joi Validation Middleware Factory
 * Creates middleware that validates request data against a Joi schema
 */

/**
 * Validate request body
 * @param {Object} schema - Joi validation schema
 */
export const validateBody = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false, // Return all errors, not just the first
            stripUnknown: true // Remove unknown fields
        });

        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message.replace(/"/g, '')
                }))
            });
        }

        req.body = value; // Use validated/sanitized value
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
            abortEarly: false
        });

        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Invalid parameters',
                details: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message.replace(/"/g, '')
                }))
            });
        }

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
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Invalid query parameters',
                details: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message.replace(/"/g, '')
                }))
            });
        }

        req.query = value;
        next();
    };
};
