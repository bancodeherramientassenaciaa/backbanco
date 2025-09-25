
import { Router } from 'express';
import { createLoan, findLoanElements, addOrUpdate, getAllLoanElements, cederTodosElementos, getLastLoan, duplicarPrestamoCorriente } from '../controllers/prestamoCorrienteController.js';
import { authenticate, verifyType, verifyRole, verifyArea } from '../middlewares/auth/authMiddleware.js';

const router = Router();
// Ruta para duplicar el último préstamo global
router.post('/duplicar/:idprestamo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, duplicarPrestamoCorriente);

// Endpoint para obtener el último préstamo corriente
router.get('/ultimo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, getLastLoan);

router.post('/', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, createLoan);
router.get('/todosPrestamos', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, getAllLoanElements);
router.post('/addElements/:idprestamo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, addOrUpdate);
router.post('/cederTodos/:idprestamo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, cederTodosElementos);

router.get('/:idprestamo/elementos', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, findLoanElements);

export default router;