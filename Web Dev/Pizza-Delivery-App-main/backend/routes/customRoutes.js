import express from 'express';
import { getBuilderOptions } from '../controllers/customPizzaController.js';

const router = express.Router();

router.get('/options', getBuilderOptions);

export default router;
