import express from 'express';
import {
    createResource,
    getAllResources,
    getResourceById,
    updateResource,
    deleteResource,
    getPublicResources,
    getResourceForPlay
} from '../controllers/resourceController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { createResourceSchema, updateResourceSchema, idParamSchema } from '../validation/schemas.js';

const router = express.Router();

/**
 * Note: These /resource endpoints map to the Quiz collection internally.
 * This naming follows the rubric requirement for "/resource" endpoint pattern.
 */

/**
 * @route   GET /resource/public
 * @desc    Get all public quizzes (for play list)
 * @access  Public
 */
router.get('/public', getPublicResources);

/**
 * @route   GET /resource/:id/play
 * @desc    Get quiz for playing
 * @access  Public (for public quizzes) / Private (for private quizzes)
 */
router.get('/:id/play', optionalAuth, validateParams(idParamSchema), getResourceForPlay);

/**
 * @route   POST /resource
 * @desc    Create a new quiz
 * @access  Private
 */
router.post('/', authenticate, validateBody(createResourceSchema), createResource);

/**
 * @route   GET /resource
 * @desc    Get all quizzes for logged-in user (admin gets all)
 * @access  Private
 */
router.get('/', authenticate, getAllResources);

/**
 * @route   GET /resource/:id
 * @desc    Get a single quiz by ID
 * @access  Private
 */
router.get('/:id', authenticate, validateParams(idParamSchema), getResourceById);

/**
 * @route   PUT /resource/:id
 * @desc    Update a quiz by ID
 * @access  Private (owner or admin)
 */
router.put('/:id', authenticate, validateParams(idParamSchema), validateBody(updateResourceSchema), updateResource);

/**
 * @route   DELETE /resource/:id
 * @desc    Delete a quiz by ID
 * @access  Private (owner or admin)
 */
router.delete('/:id', authenticate, validateParams(idParamSchema), deleteResource);

export default router;
