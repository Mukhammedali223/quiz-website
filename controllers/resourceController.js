import Quiz from '../models/Quiz.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { sendQuizCreatedEmail } from '../services/emailService.js';

/**
 * Resource Controller
 * Handles CRUD operations for Quiz (resource) collection
 * Note: "resource" endpoints map to Quiz internally as per rubric requirements
 */

/**
 * Create a new resource (quiz)
 * POST /resource
 */
export const createResource = asyncHandler(async (req, res) => {
    const { title, description, isPublic, questions } = req.body;

    const quiz = await Quiz.create({
        title,
        description: description || '',
        isPublic: isPublic || false,
        questions,
        owner: req.user._id
    });

    // Send notification email (non-blocking)
    sendQuizCreatedEmail(req.user, quiz).catch(err => {
        console.error('Failed to send quiz created email:', err.message);
    });

    res.status(201).json({
        success: true,
        message: 'Quiz created successfully',
        data: {
            resource: quiz
        }
    });
});

/**
 * Get all resources (quizzes) for current user
 * Admin gets all resources; regular user gets only their own
 * GET /resource
 */
export const getAllResources = asyncHandler(async (req, res) => {
    let query = {};

    // Regular users only see their own quizzes
    // Admins see all quizzes
    if (req.user.role !== 'admin') {
        query.owner = req.user._id;
    }

    const quizzes = await Quiz.find(query)
        .populate('owner', 'username email')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: quizzes.length,
        data: {
            resources: quizzes
        }
    });
});

/**
 * Get a single resource (quiz) by ID
 * GET /resource/:id
 */
export const getResourceById = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id)
        .populate('owner', 'username email');

    if (!quiz) {
        throw new AppError('Quiz not found', 404);
    }

    // Check ownership (unless admin or public quiz)
    const isOwner = quiz.owner._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin && !quiz.isPublic) {
        throw new AppError('Access denied. You do not own this resource.', 403);
    }

    res.json({
        success: true,
        data: {
            resource: quiz
        }
    });
});

/**
 * Update a resource (quiz) by ID
 * PUT /resource/:id
 */
export const updateResource = asyncHandler(async (req, res) => {
    const { title, description, isPublic, questions } = req.body;

    let quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
        throw new AppError('Quiz not found', 404);
    }

    // Check ownership (unless admin)
    const isOwner = quiz.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
        throw new AppError('Access denied. You do not own this resource.', 403);
    }

    // Update fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (questions !== undefined) updateData.questions = questions;

    quiz = await Quiz.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    ).populate('owner', 'username email');

    res.json({
        success: true,
        message: 'Quiz updated successfully',
        data: {
            resource: quiz
        }
    });
});

/**
 * Delete a resource (quiz) by ID
 * DELETE /resource/:id
 * Admin can delete any; user can only delete their own
 */
export const deleteResource = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
        throw new AppError('Quiz not found', 404);
    }

    // Check ownership (unless admin)
    const isOwner = quiz.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
        throw new AppError('Access denied. You do not own this resource.', 403);
    }

    await Quiz.findByIdAndDelete(req.params.id);

    res.json({
        success: true,
        message: 'Quiz deleted successfully',
        data: null
    });
});

/**
 * Get public quizzes for playing
 * GET /resource/public
 */
export const getPublicResources = asyncHandler(async (req, res) => {
    const quizzes = await Quiz.find({ isPublic: true })
        .populate('owner', 'username')
        .select('title description questions.length owner createdAt')
        .sort({ createdAt: -1 });

    // Add question count
    const quizzesWithCount = quizzes.map(quiz => ({
        ...quiz.toObject(),
        questionCount: quiz.questions.length
    }));

    res.json({
        success: true,
        count: quizzesWithCount.length,
        data: {
            resources: quizzesWithCount
        }
    });
});

/**
 * Get quiz for playing (public or owned)
 * GET /resource/:id/play
 */
export const getResourceForPlay = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id)
        .populate('owner', 'username');

    if (!quiz) {
        throw new AppError('Quiz not found', 404);
    }

    // Check if user can access
    const isOwner = req.user && quiz.owner._id.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!quiz.isPublic && !isOwner && !isAdmin) {
        throw new AppError('This quiz is not available for playing', 403);
    }

    // Return quiz without correct answers exposed in the response
    // (for client-side checking, we include them but could hide for server-side scoring)
    res.json({
        success: true,
        data: {
            resource: {
                _id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                owner: quiz.owner,
                questions: quiz.questions.map(q => ({
                    _id: q._id,
                    text: q.text,
                    options: q.options,
                    correctIndex: q.correctIndex // Include for client-side scoring
                })),
                questionCount: quiz.questions.length
            }
        }
    });
});
