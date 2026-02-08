import Joi from 'joi';

/**
 * Validation Schemas using Joi
 * All request validation schemas for the application
 */

// ===== AUTH SCHEMAS =====

/**
 * Register Schema
 * - username: 3-30 chars, alphanumeric with underscores
 * - email: valid email format
 * - password: min 8 chars, requires uppercase, lowercase, number
 */
export const registerSchema = Joi.object({
    username: Joi.string()
        .min(3)
        .max(30)
        .pattern(/^[a-zA-Z0-9_]+$/)
        .required()
        .messages({
            'string.min': 'Username must be at least 3 characters',
            'string.max': 'Username cannot exceed 30 characters',
            'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
            'any.required': 'Username is required'
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            'any.required': 'Password is required'
        })
});

/**
 * Login Schema
 * - email: required
 * - password: required
 */
export const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        })
});

// ===== USER SCHEMAS =====

/**
 * Update Profile Schema
 * - username: optional, 3-30 chars
 * - email: optional, valid email
 */
export const updateProfileSchema = Joi.object({
    username: Joi.string()
        .min(3)
        .max(30)
        .pattern(/^[a-zA-Z0-9_]+$/)
        .messages({
            'string.min': 'Username must be at least 3 characters',
            'string.max': 'Username cannot exceed 30 characters',
            'string.pattern.base': 'Username can only contain letters, numbers, and underscores'
        }),
    email: Joi.string()
        .email()
        .messages({
            'string.email': 'Please enter a valid email address'
        })
}).min(1).messages({
    'object.min': 'At least one field (username or email) must be provided'
});

// ===== RESOURCE (QUIZ) SCHEMAS =====

/**
 * Question Schema (for embedded questions)
 */
const questionSchema = Joi.object({
    text: Joi.string()
        .min(1)
        .max(500)
        .required()
        .messages({
            'string.min': 'Question text is required',
            'string.max': 'Question text cannot exceed 500 characters',
            'any.required': 'Question text is required'
        }),
    options: Joi.array()
        .items(Joi.string().min(1).max(200))
        .min(2)
        .max(6)
        .required()
        .messages({
            'array.min': 'Each question must have at least 2 options',
            'array.max': 'Each question can have at most 6 options',
            'any.required': 'Options are required'
        }),
    correctIndex: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
            'number.min': 'Correct index must be at least 0',
            'any.required': 'Correct answer index is required'
        })
}).custom((value, helpers) => {
    // Validate correctIndex is within options bounds
    if (value.correctIndex >= value.options.length) {
        return helpers.error('any.invalid', { message: 'Correct index must be less than the number of options' });
    }
    return value;
});

/**
 * Create Resource (Quiz) Schema
 */
export const createResourceSchema = Joi.object({
    title: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.min': 'Title must be at least 3 characters',
            'string.max': 'Title cannot exceed 100 characters',
            'any.required': 'Title is required'
        }),
    description: Joi.string()
        .max(500)
        .allow('')
        .messages({
            'string.max': 'Description cannot exceed 500 characters'
        }),
    isPublic: Joi.boolean()
        .default(false),
    questions: Joi.array()
        .items(questionSchema)
        .min(1)
        .required()
        .messages({
            'array.min': 'Quiz must have at least 1 question',
            'any.required': 'Questions are required'
        })
});

/**
 * Update Resource (Quiz) Schema
 */
export const updateResourceSchema = Joi.object({
    title: Joi.string()
        .min(3)
        .max(100)
        .messages({
            'string.min': 'Title must be at least 3 characters',
            'string.max': 'Title cannot exceed 100 characters'
        }),
    description: Joi.string()
        .max(500)
        .allow('')
        .messages({
            'string.max': 'Description cannot exceed 500 characters'
        }),
    isPublic: Joi.boolean(),
    questions: Joi.array()
        .items(questionSchema)
        .min(1)
        .messages({
            'array.min': 'Quiz must have at least 1 question'
        })
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});

/**
 * ID Parameter Schema
 */
export const idParamSchema = Joi.object({
    id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid ID format',
            'any.required': 'ID is required'
        })
});
