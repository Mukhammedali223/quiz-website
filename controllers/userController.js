import User from '../models/User.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get current user profile
 * GET /users/profile
 */
export const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    res.json({
        success: true,
        data: {
            user: user.toJSON()
        }
    });
});

/**
 * Update current user profile
 * PUT /users/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
    const { username, email } = req.body;

    // Check for duplicate username/email
    if (username || email) {
        const query = [];
        if (username && username !== req.user.username) {
            query.push({ username });
        }
        if (email && email !== req.user.email) {
            query.push({ email });
        }

        if (query.length > 0) {
            const existingUser = await User.findOne({
                $or: query,
                _id: { $ne: req.user._id }
            });

            if (existingUser) {
                if (existingUser.username === username) {
                    throw new AppError('Username already taken', 400);
                }
                if (existingUser.email === email) {
                    throw new AppError('Email already in use', 400);
                }
            }
        }
    }

    // Update fields
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            user: user.toJSON()
        }
    });
});
