import express from 'express';
import {
    generateChapterTopics,
    generateLessonContent,
    getSyllabus,
    getTopics,
    getTopicContent
} from './curriculum-controller.js';
import { verifyToken } from '../shared/middleware/auth-middleware.js';

const router = express.Router();

router.get('/:type/syllabus', verifyToken, getSyllabus);
router.get('/:type/topics', verifyToken, getTopics);
router.get('/:type/topic-content', verifyToken, getTopicContent);

router.post('/generate-topics', verifyToken, generateChapterTopics);
router.post('/generate-lesson', verifyToken, generateLessonContent);

export default router;
