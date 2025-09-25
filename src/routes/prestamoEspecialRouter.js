import { Router } from 'express';
import { createPrestamoEspecial, getAllLoanElements, findLoanElements, addOrUpdate, getAllLoanElementsTotal } from '../controllers/prestamoEspecialController.js';
import { authenticate, verifyType, verifyRole, verifyArea } from '../middlewares/auth/authMiddleware.js';
import upload from '../middlewares/archivoPrestamoEspecialMiddleware.js';

const router = Router();

router.post('/', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, createPrestamoEspecial);
router.get('/', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, getAllLoanElements);
router.get('/todosEspeciales', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, getAllLoanElementsTotal);
// Endpoint para duplicar préstamo especial
import { duplicateLoanEspecial } from '../controllers/prestamoEspecialController.js';
router.post('/:idprestamo/duplicar', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, duplicateLoanEspecial);
router.get('/:idprestamo/elementos', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, findLoanElements);
router.post('/acciones/:idprestamo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, upload.single('archivo'), addOrUpdate);

export default router;