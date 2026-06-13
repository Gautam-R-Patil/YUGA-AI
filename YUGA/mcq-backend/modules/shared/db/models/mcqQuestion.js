import mongoose from "mongoose";

const mcqQuestionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    required: true,
    index: true,
    enum: ['NEET AI Examiner', 'NEET Physics MCQs', 'NEET Chemistry MCQs', 'NEET Biology MCQs', 'Mathematics', 'Science', 'Social Science', 'English']
  },
  // ... existing fields ...
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for querying by subject and sorting by date (common pattern)
mcqQuestionSchema.index({ subject: 1, createdAt: 1 });

// Update the updatedAt field before saving
mcqQuestionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const MCQQuestion = mongoose.model("MCQQuestion", mcqQuestionSchema);

export default MCQQuestion;