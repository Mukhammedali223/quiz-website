import express from 'express';
import { register, login } from '../controllers/authController.js';
import { validateBody } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validation/schemas.js';

const router = express.Router();

/**
 * @route   POST /register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateBody(registerSchema), register);

/**
 * @route   POST /login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post('/login', validateBody(loginSchema), login);

export default router;
