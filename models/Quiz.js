import mongoose from 'mongoose';

/**
 * Question Sub-Schema
 * Embedded within Quiz document
 */
const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true
    },
    options: {
        type: [String],
        required: [true, 'Options are required'],
        validate: {
            validator: function (v) {
                return v.length >= 2 && v.length <= 6;
            },
            message: 'Question must have between 2 and 6 options'
        }
    },
    correctIndex: {
        type: Number,
        required: [true, 'Correct answer index is required'],
        min: [0, 'Correct index must be at least 0'],
        validate: {
            validator: function (v) {
                return v < this.options.length;
            },
            message: 'Correct index must be less than number of options'
        }
    }
}, { _id: true });

/**
 * Quiz Schema (Resource)
 * This is the main "resource" collection as per the rubric
 */
const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Quiz title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Quiz owner is required']
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    questions: {
        type: [questionSchema],
        validate: {
            validator: function (v) {
                return v.length >= 1;
            },
            message: 'Quiz must have at least 1 question'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false // We manually handle timestamps
});

// Update the updatedAt timestamp before saving
quizSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

quizSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: new Date() });
    next();
});

// Index for faster queries
quizSchema.index({ owner: 1 });
quizSchema.index({ isPublic: 1 });
quizSchema.index({ createdAt: -1 });

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
