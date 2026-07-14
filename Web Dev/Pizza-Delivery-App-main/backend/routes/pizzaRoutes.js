import express from 'express';
import {
  getAllPizzas,
  getPizzaById,
  createPizza,
  updatePizza,
  deletePizza,
  addReview,
  getRecommendations
} from '../controllers/pizzaController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getAllPizzas)
  .post(protect, admin, createPizza);

router.get('/recommendations', getRecommendations);

router.route('/:id')
  .get(getPizzaById)
  .put(protect, admin, updatePizza)
  .delete(protect, admin, deletePizza);

router.post('/:id/reviews', protect, addReview);

export default router;
