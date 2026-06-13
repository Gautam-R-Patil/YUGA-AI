import MCQQuestion from "../shared/db/models/mcqQuestion.js";
import { extractTextFromImage } from "../ai/ocr-service.js";

// ... existing code ...

// Get questions by subject (with approval filtering)
export const getQuestionsBySubject = async (subject, options = {}) => {
    const limit = parseInt(options.limit) || 50;
    const skip = parseInt(options.skip) || 0;

    return await MCQQuestion.find({ subject })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean();
};

// Get all available subjects
export const getAvailableSubjects = async () => {
    return await MCQQuestion.distinct('subject');
};

// Create new question
export const createQuestion = async (questionData) => {
    // ... existing code ...
    const {
        id,
        question,
        options,
        correctAnswer,
        explanation,
        subject,
        difficulty,
        tags,
        image,
        imageContentType,
        answerImage,
        answerImageContentType
    } = questionData;

    // Check if question with same ID already exists
    const existingQuestion = await MCQQuestion.findOne({ id });
    if (existingQuestion) {
        throw { status: 400, message: "Question with this ID already exists" };
    }

    // Extract OCR text from images if provided
    let imageOcrText = '';
    let answerImageOcrText = '';

    try {
        // Extract text from question image
        if (image) {
            imageOcrText = await extractTextFromImage(image, imageContentType);
        }

        // Extract text from answer image
        if (answerImage) {
            answerImageOcrText = await extractTextFromImage(answerImage, answerImageContentType);
        }
    } catch (ocrError) {
        // Log OCR errors but don't fail the question creation
        console.error('OCR extraction error (non-fatal):', ocrError);
        // Continue with empty OCR text
    }

    const newQuestion = new MCQQuestion({
        id,
        question,
        options,
        correctAnswer,
        explanation: explanation || '',
        subject,
        difficulty: difficulty || 'Medium',
        tags: tags || [],
        image: image || null,
        imageContentType: imageContentType || null,
        imageOcrText: imageOcrText,
        answerImage: answerImage || null,
        answerImageContentType: answerImageContentType || null,
        answerImageOcrText: answerImageOcrText
    });

    await newQuestion.save();
    return {
        question: newQuestion,
        ocrProcessed: {
            questionImage: imageOcrText.length > 0,
            answerImage: answerImageOcrText.length > 0
        }
    };
};

// Update question
export const updateQuestion = async (id, updateData) => {
    // Handle question image update
    if (updateData.image === null || updateData.image === '') {
        updateData.image = null;
        updateData.imageContentType = null;
        updateData.imageOcrText = '';
    } else if (updateData.image) {
        try {
            updateData.imageOcrText = await extractTextFromImage(updateData.image, updateData.imageContentType);
        } catch (ocrError) {
            console.error('OCR extraction error (non-fatal):', ocrError);
            updateData.imageOcrText = '';
        }
    }

    // Handle answer image update
    if (updateData.answerImage === null || updateData.answerImage === '') {
        updateData.answerImage = null;
        updateData.answerImageContentType = null;
        updateData.answerImageOcrText = '';
    } else if (updateData.answerImage) {
        try {
            updateData.answerImageOcrText = await extractTextFromImage(updateData.answerImage, updateData.answerImageContentType);
        } catch (ocrError) {
            console.error('OCR extraction error (non-fatal):', ocrError);
            updateData.answerImageOcrText = '';
        }
    }

    const updatedQuestion = await MCQQuestion.findOneAndUpdate(
        { id },
        { ...updateData, updatedAt: Date.now() },
        { new: true, runValidators: true }
    ).lean();

    if (!updatedQuestion) {
        throw { status: 404, message: "Question not found" };
    }

    return {
        question: updatedQuestion,
        ocrProcessed: {
            questionImage: updateData.imageOcrText ? updateData.imageOcrText.length > 0 : false,
            answerImage: updateData.answerImageOcrText ? updateData.answerImageOcrText.length > 0 : false
        }
    };
};

// Delete question
export const deleteQuestion = async (id) => {
    const deletedQuestion = await MCQQuestion.findOneAndDelete({ id });
    if (!deletedQuestion) {
        throw { status: 404, message: "Question not found" };
    }
    return deletedQuestion;
};

// Backfill OCR text for existing questions
export const backfillOCR = async (limit = 100, subject) => {
    // Build query to find questions with images but no OCR text
    const query = {
        $or: [
            { image: { $ne: null }, imageOcrText: { $in: [null, ''] } },
            { answerImage: { $ne: null }, answerImageOcrText: { $in: [null, ''] } }
        ]
    };

    if (subject) {
        query.subject = subject;
    }

    // Find questions that need OCR processing
    const questions = await MCQQuestion.find(query).limit(limit);

    if (questions.length === 0) {
        return {
            success: true,
            message: 'No questions found that need OCR processing',
            processed: 0
        };
    }

    let processedCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const question of questions) {
        try {
            let updated = false;

            // Extract text from question image if exists and OCR text is missing
            if (question.image && (!question.imageOcrText || question.imageOcrText === '')) {
                const imageOcrText = await extractTextFromImage(question.image, question.imageContentType);
                question.imageOcrText = imageOcrText;
                updated = true;
            }

            // Extract text from answer image if exists and OCR text is missing
            if (question.answerImage && (!question.answerImageOcrText || question.answerImageOcrText === '')) {
                const answerImageOcrText = await extractTextFromImage(question.answerImage, question.answerImageContentType);
                question.answerImageOcrText = answerImageOcrText;
                updated = true;
            }

            if (updated) {
                await question.save();
                processedCount++;
            }
        } catch (error) {
            console.error(`Error processing question ${question.id}:`, error);
            errorCount++;
            errors.push({
                questionId: question.id,
                error: error.message
            });
        }
    }

    return {
        success: true,
        message: `OCR backfill completed`,
        totalFound: questions.length,
        processed: processedCount,
        errors: errorCount,
        errorDetails: errors.length > 0 ? errors : undefined
    };
};

// Get OCR text for a specific question
export const getQuestionOCR = async (id) => {
    const question = await MCQQuestion.findOne({ id }).select('imageOcrText answerImageOcrText').lean();

    if (!question) {
        throw { status: 404, message: 'Question not found' };
    }

    return {
        success: true,
        questionId: id,
        imageOcrText: question.imageOcrText || '',
        answerImageOcrText: question.answerImageOcrText || ''
    };
};

// End of file
