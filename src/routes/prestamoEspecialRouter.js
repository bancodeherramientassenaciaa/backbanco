import { Router } from 'express';
import { createPrestamoEspecial, getAllLoanElements, findLoanElements, addOrUpdate, getAllLoanElementsTotal } from '../controllers/prestamoEspecialController.js';
import { authenticate, verifyType, verifyRole, verifyArea } from '../middlewares/auth/authMiddleware.js';
import upload from '../middlewares/archivoPrestamoEspecialMiddleware.js';

const router = Router();

router.post('/', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, createPrestamoEspecial);
router.get('/', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, getAllLoanElements);
router.get('/todosEspeciales', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, getAllLoanElementsTotal);
router.get('/:idprestamo/elementos', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, findLoanElements);
router.post('/acciones/:idprestamo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, upload.single('archivo'), addOrUpdate);

export default router;