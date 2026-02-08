import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

const SALT_ROUNDS = 12;

/**
 * Register a new user
 * POST /register
 */
export const register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existingUser) {
        if (existingUser.email === email) {
            throw new AppError('Email already registered', 400);
        }
        throw new AppError('Username already taken', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await User.create({
        username,
        email,
        passwordHash,
        role: 'user' // Default role
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user).catch(err => {
        console.error('Failed to send welcome email:', err.message);
    });

    // Generate JWT token
    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
            user: user.toJSON(),
            token
        }
    });
});

/**
 * Login user
 * POST /login
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
        throw new AppError('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: user.toJSON(),
            token
        }
    });
});
