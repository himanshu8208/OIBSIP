import express from 'express';
import {
  getInventoryList,
  updateInventoryItem,
  createInventoryItem,
  getInventoryAlerts
} from '../controllers/inventoryController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(admin); // All inventory routes are admin-only

router.route('/')
  .get(getInventoryList)
  .post(createInventoryItem);

router.get('/alerts', getInventoryAlerts);
router.put('/:id', updateInventoryItem);

export default router;
