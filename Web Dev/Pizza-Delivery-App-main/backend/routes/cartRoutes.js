import express from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // Secure all cart routes

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route('/:itemId')
  .put(updateCartItemQuantity)
  .delete(removeFromCart);

export default router;
