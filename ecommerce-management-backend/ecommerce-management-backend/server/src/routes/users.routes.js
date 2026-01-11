import { Router } from 'express';
import { getUsers, postUsers, removeUsers } from '../controllers/users.controller.js';

const router = Router();

router.get('/', getUsers);
router.post('/', postUsers);
router.delete('/:id', removeUsers);

export default router;
