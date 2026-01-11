import { Router } from 'express';
import {
  getPromotions,
  postPromotions,
  removePromotions,
} from '../controllers/promotions.controller.js';

const router = Router();

router.get('/', getPromotions);
router.post('/', postPromotions);
router.delete('/:id', removePromotions);

export default router;
