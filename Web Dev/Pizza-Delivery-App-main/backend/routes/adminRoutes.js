import express from 'express';
import { getAnalyticsDashboardStats, getAllUsers } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(admin); // Secure all endpoints for administrator access

router.get('/analytics', getAnalyticsDashboardStats);
router.get('/users', getAllUsers);

export default router;
