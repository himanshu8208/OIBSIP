import express from 'express';
import {
  placeOrder,
  verifyOrderPayment,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // Secure all order routes

router.post('/', placeOrder);
router.post('/verify', verifyOrderPayment);
router.get('/my-orders', getUserOrders);

// Admin only routes
router.get('/admin/all', admin, getAllOrders);
router.put('/:id/status', admin, updateOrderStatus);

// Details by ID (Can be requested by standard user who owns the order OR an admin)
router.get('/:id', getOrderById);

export default router;
