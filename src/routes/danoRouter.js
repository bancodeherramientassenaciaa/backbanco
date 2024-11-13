import { Router } from 'express';
import { getAllDanos, returnDano } from '../controllers/danoController.js';
import { authenticate, verifyType, verifyRole } from '../middlewares/auth/authMiddleware.js';

const router = Router();

router.get('/', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), getAllDanos);
router.post('/return', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), returnDano)

export default router;
