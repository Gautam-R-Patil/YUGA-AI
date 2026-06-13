import express from 'express';
import { getNotifications } from './notification-controller.js';
import { verifyToken } from '../shared/middleware/auth-middleware.js';

const router = express.Router();

router.get('/', verifyToken, getNotifications);

export default router;
