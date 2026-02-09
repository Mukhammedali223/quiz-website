import Joi from 'joi';

/**
 * Validation Schemas using Joi
 * All request validation schemas for the application
 * 
 * SECURITY HARDENING:
 * - All string fields use .trim() to remove leading/trailing whitespace
 * - Passwords are NOT trimmed (intentional spaces allowed)
 * - .strict() enforces type coercion rules
 * - Empty strings and whitespace-only values are rejected
 * - All arrays enforce minimum items
 * - Unknown fields are stripped by middleware
 */

// ===== CUSTOM VALIDATORS =====

/**
 * Custom validator to reject whitespace-only strings after trim
 * This catches cases where a field becomes empty after trimming
 */
const notWhitespaceOnly = (value, helpers) => {
    if (typeof value === 'string' && value.trim().length === 0) {
        return helpers.error('string.empty');
    }
    return value;
};

// ===== AUTH SCHEMAS =====

/**
 * Register Schema
 * - username: 3-30 chars, alphanumeric with underscores, trimmed
 * - email: valid email format, trimmed, lowercase
 * - password: min 8 chars, requires uppercase, lowercase, number (NOT trimmed)
 */
export const registerSchema = Joi.object({
    username: Joi.string()
        .trim()
        .min(3)
        .max(30)
        .pattern(/^[a-zA-Z0-9_]+$/)
        .required()
        .strict()
        .messages({
            'string.base': 'Username must be a string',
            'string.empty': 'Username cannot be empty',
            'string.min': 'Username must be at least 3 characters',
            'string.max': 'Username cannot exceed 30 characters',
            'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
            'any.required': 'Username is required'
        }),
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .max(254)
        .required()
        .strict()
        .messages({
            'string.base': 'Email must be a string',
            'string.empty': 'Email cannot be empty',
            'string.email': 'Please enter a valid email address',
            'string.max': 'Email cannot exceed 254 characters',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .strict()
        .messages({
            'string.base': 'Password must be a string',
            'string.empty': 'Password cannot be empty',
            'string.min': 'Password must be at least 8 characters',
            'string.max': 'Password cannot exceed 128 characters',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            'any.required': 'Password is required'
        })
}).strict();

/**
 * Login Schema
 * - email: required, trimmed
 * - password: required (NOT trimmed)
 */
export const loginSchema = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .max(254)
        .required()
        .strict()
        .messages({
            'string.base': 'Email must be a string',
            'string.empty': 'Email cannot be empty',
            'string.email': 'Please enter a valid email address',
            'string.max': 'Email cannot exceed 254 characters',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .min(1)
        .max(128)
        .required()
        .strict()
        .messages({
            'string.base': 'Password must be a string',
            'string.empty': 'Password cannot be empty',
            'string.min': 'Password is required',
            'string.max': 'Password cannot exceed 128 characters',
            'any.required': 'Password is required'
        })
}).strict();

// ===== USER SCHEMAS =====

/**
 * Update Profile Schema
 * - username: optional, 3-30 chars, trimmed
 * - email: optional, valid email, trimmed
 * - At least one field required
 */
export const updateProfileSchema = Joi.object({
    username: Joi.string()
        .trim()
        .min(3)
        .max(30)
        .pattern(/^[a-zA-Z0-9_]+$/)
        .strict()
        .messages({
            'string.base': 'Username must be a string',
            'string.empty': 'Username cannot be empty',
            'string.min': 'Username must be at least 3 characters',
            'string.max': 'Username cannot exceed 30 characters',
            'string.pattern.base': 'Username can only contain letters, numbers, and underscores'
        }),
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .max(254)
        .strict()
        .messages({
            'string.base': 'Email must be a string',
            'string.empty': 'Email cannot be empty',
            'string.email': 'Please enter a valid email address',
            'string.max': 'Email cannot exceed 254 characters'
        })
}).min(1).strict().messages({
    'object.min': 'At least one field (username or email) must be provided'
});

// ===== RESOURCE (QUIZ) SCHEMAS =====

/**
 * Question Schema (for embedded questions)
 * - text: 1-500 chars, trimmed, required
 * - options: array of 2-6 non-empty strings, each trimmed
 * - correctIndex: integer within options bounds
 */
const questionSchema = Joi.object({
    text: Joi.string()
        .trim()
        .min(1)
        .max(500)
        .required()
        .strict()
        .messages({
            'string.base': 'Question text must be a string',
            'string.empty': 'Question text cannot be empty',
            'string.min': 'Question text is required',
            'string.max': 'Question text cannot exceed 500 characters',
            'any.required': 'Question text is required'
        }),
    options: Joi.array()
        .items(
            Joi.string()
                .trim()
                .min(1)
                .max(200)
                .strict()
                .messages({
                    'string.base': 'Option must be a string',
                    'string.empty': 'Option cannot be empty',
                    'string.min': 'Option cannot be empty',
                    'string.max': 'Option cannot exceed 200 characters'
                })
        )
        .min(2)
        .max(6)
        .required()
        .messages({
            'array.base': 'Options must be an array',
            'array.min': 'Each question must have at least 2 options',
            'array.max': 'Each question can have at most 6 options',
            'array.includesRequiredUnknowns': 'All options must be valid strings',
            'any.required': 'Options are required'
        }),
    correctIndex: Joi.number()
        .integer()
        .min(0)
        .max(5)
        .required()
        .strict()
        .messages({
            'number.base': 'Correct index must be a number',
            'number.integer': 'Correct index must be an integer',
            'number.min': 'Correct index must be at least 0',
            'number.max': 'Correct index cannot exceed 5',
            'any.required': 'Correct answer index is required'
        })
}).strict().custom((value, helpers) => {
    // Validate correctIndex is within options bounds
    if (value.correctIndex >= value.options.length) {
        return helpers.error('any.custom', { 
            message: 'Correct index must be less than the number of options' 
        });
    }
    return value;
}).messages({
    'any.custom': 'Correct index must be less than the number of options'
});

/**
 * Create Resource (Quiz) Schema
 * - title: 3-100 chars, trimmed, required
 * - description: 0-500 chars, trimmed, optional
 * - isPublic: boolean, defaults to false
 * - questions: array of 1+ question objects, required
 */
export const createResourceSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required()
        .strict()
        .messages({
            'string.base': 'Title must be a string',
            'string.empty': 'Title cannot be empty',
            'string.min': 'Title must be at least 3 characters',
            'string.max': 'Title cannot exceed 100 characters',
            'any.required': 'Title is required'
        }),
    description: Joi.string()
        .trim()
        .max(500)
        .allow('')
        .default('')
        .strict()
        .messages({
            'string.base': 'Description must be a string',
            'string.max': 'Description cannot exceed 500 characters'
        }),
    isPublic: Joi.boolean()
        .default(false)
        .strict()
        .messages({
            'boolean.base': 'isPublic must be a boolean'
        }),
    questions: Joi.array()
        .items(questionSchema)
        .min(1)
        .max(100)
        .required()
        .messages({
            'array.base': 'Questions must be an array',
            'array.min': 'Quiz must have at least 1 question',
            'array.max': 'Quiz cannot have more than 100 questions',
            'array.includesRequiredUnknowns': 'All questions must be valid',
            'any.required': 'Questions are required'
        })
}).strict();

/**
 * Update Resource (Quiz) Schema
 * - All fields optional but at least one required
 * - Same validation rules as create schema
 */
export const updateResourceSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .strict()
        .messages({
            'string.base': 'Title must be a string',
            'string.empty': 'Title cannot be empty',
            'string.min': 'Title must be at least 3 characters',
            'string.max': 'Title cannot exceed 100 characters'
        }),
    description: Joi.string()
        .trim()
        .max(500)
        .allow('')
        .strict()
        .messages({
            'string.base': 'Description must be a string',
            'string.max': 'Description cannot exceed 500 characters'
        }),
    isPublic: Joi.boolean()
        .strict()
        .messages({
            'boolean.base': 'isPublic must be a boolean'
        }),
    questions: Joi.array()
        .items(questionSchema)
        .min(1)
        .max(100)
        .messages({
            'array.base': 'Questions must be an array',
            'array.min': 'Quiz must have at least 1 question',
            'array.max': 'Quiz cannot have more than 100 questions',
            'array.includesRequiredUnknowns': 'All questions must be valid'
        })
}).min(1).strict().messages({
    'object.min': 'At least one field must be provided for update'
});

/**
 * ID Parameter Schema
 * - MongoDB ObjectId format (24 hex characters)
 * - Trimmed to prevent whitespace bypass
 */
export const idParamSchema = Joi.object({
    id: Joi.string()
        .trim()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .strict()
        .messages({
            'string.base': 'ID must be a string',
            'string.empty': 'ID cannot be empty',
            'string.pattern.base': 'Invalid ID format',
            'any.required': 'ID is required'
        })
}).strict();
