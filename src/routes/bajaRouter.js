import { Router } from 'express';
import { createReintegro, getAllReintegros, createTraspaso, getAllTraspasos, returnTraspaso } from '../controllers/bajaController.js';
import { authenticate, verifyType, verifyRole, verifyArea } from '../middlewares/auth/authMiddleware.js';

const router = Router();

router.post('/reintegros', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), createReintegro);
router.post('/traspasos', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), createTraspaso);
router.get('/reintegros', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, getAllReintegros);
router.get('/traspasos', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, getAllTraspasos);
router.post('/traspaso/return', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, returnTraspaso);

export default router;