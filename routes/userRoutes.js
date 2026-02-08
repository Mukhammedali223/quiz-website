import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { updateProfileSchema } from '../validation/schemas.js';

const router = express.Router();

/**
 * @route   GET /users/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   PUT /users/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.put('/profile', authenticate, validateBody(updateProfileSchema), updateProfile);

export default router;
