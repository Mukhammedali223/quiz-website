import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import expressLayouts from 'express-ejs-layouts';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import { initEmailService } from './services/emailService.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Initialize email service
initEmailService();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || true
        : '*',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        error: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/register', limiter);
app.use('/login', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// API Routes
app.use('/', authRoutes);
app.use('/users', userRoutes);
app.use('/resource', resourceRoutes);

// Page Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'Quiz Website - Home' });
});

app.get('/auth/register', (req, res) => {
    res.render('auth/register', { title: 'Register - Quiz Website' });
});

app.get('/auth/login', (req, res) => {
    res.render('auth/login', { title: 'Login - Quiz Website' });
});

app.get('/profile', (req, res) => {
    res.render('users/profile', { title: 'My Profile - Quiz Website' });
});

app.get('/quizzes', (req, res) => {
    res.render('resource/list', { title: 'My Quizzes - Quiz Website' });
});

app.get('/quizzes/create', (req, res) => {
    res.render('resource/create', { title: 'Create Quiz - Quiz Website' });
});

app.get('/quizzes/edit/:id', (req, res) => {
    res.render('resource/edit', {
        title: 'Edit Quiz - Quiz Website',
        quizId: req.params.id
    });
});

app.get('/quizzes/view/:id', (req, res) => {
    res.render('resource/view', {
        title: 'View Quiz - Quiz Website',
        quizId: req.params.id
    });
});

app.get('/play', (req, res) => {
    res.render('play/select', { title: 'Play Quiz - Quiz Website' });
});

app.get('/play/:id', (req, res) => {
    res.render('play/quiz', {
        title: 'Playing Quiz - Quiz Website',
        quizId: req.params.id
    });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
