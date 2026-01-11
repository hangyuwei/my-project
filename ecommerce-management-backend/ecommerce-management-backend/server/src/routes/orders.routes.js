import { Router } from 'express';
import {
  getOrderDetailById,
  getOrders,
  patchOrdersBatch,
  postOrders,
  removeOrders,
} from '../controllers/orders.controller.js';

const router = Router();

router.get('/', getOrders);
router.post('/', postOrders);
router.delete('/:id', removeOrders);
router.patch('/batch', patchOrdersBatch);
router.get('/:id/detail', getOrderDetailById);

export default router;
