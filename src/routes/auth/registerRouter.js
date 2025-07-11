// routes/auth/registerRouter.js
import { Router } from 'express';
import { registerFirstAdmin } from '../../controllers/auth/registerController.js';

const router = Router();

router.post('/', registerFirstAdmin);

export default router;
