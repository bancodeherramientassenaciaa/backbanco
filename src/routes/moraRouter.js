import { Router } from 'express';
import { getAllMoras, returnMora } from '../controllers/moraController.js';
import { authenticate, verifyType, verifyRole } from '../middlewares/auth/authMiddleware.js';

const router = Router();

router.get('/', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), getAllMoras);
router.post('/return', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), returnMora)

export default router;
