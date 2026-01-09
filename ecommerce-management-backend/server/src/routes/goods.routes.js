import { Router } from 'express';
import {
  getGoods,
  patchGoodsStatus,
  postGoods,
  removeGoods,
} from '../controllers/goods.controller.js';

const router = Router();

router.get('/', getGoods);
router.post('/', postGoods);
router.delete('/:id', removeGoods);
router.patch('/:id/status', patchGoodsStatus);

export default router;
