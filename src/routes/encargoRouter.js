import { Router } from 'express';
import { createEncargo, cancelEncargo, getInstructorEncargos, getAdminEncargos, rejectEncargo, acceptEncargo, reclaimEncargo, cancelAceptar } from '../controllers/encargoController.js';
import { authenticate, verifyType, verifyRole, verifyArea } from '../middlewares/auth/authMiddleware.js';

const router = Router();

router.get('/', authenticate, verifyType(['cliente']), verifyRole(['instructor']), getInstructorEncargos);
router.get('/admin', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, getAdminEncargos);
router.post('/', authenticate, verifyType(['cliente']), verifyRole(['instructor']), createEncargo);
router.post('/aceptar/:idencargo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, acceptEncargo);
router.post('/reclamar/:idencargo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, reclaimEncargo);
router.post('/rechazar/:idencargo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, rejectEncargo);
router.post('/cancel-aceptar/:idencargo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']),verifyArea, cancelAceptar);
router.delete('/:idencargo', authenticate, verifyType(['cliente']), verifyRole(['instructor']), cancelEncargo);

export default router;