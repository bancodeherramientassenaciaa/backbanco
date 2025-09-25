import { Router } from 'express';
import { createEncargo, cancelEncargo, getInstructorEncargos, getAdminEncargos, rejectEncargo, acceptEncargo, reclaimEncargo, cancelAceptar, addElementsEncargo, encargosAceptados, findEncargoElements, deleteEncargo, noReclamarEncargo, finalizarEncargo } from '../controllers/encargoController.js';
import { authenticate, verifyType, verifyRole, verifyArea } from '../middlewares/auth/authMiddleware.js';

const router = Router();

router.get('/', authenticate, verifyType(['cliente', 'instructor']), verifyRole(['instructor', 'cliente']), getInstructorEncargos);
router.get('/admin', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, getAdminEncargos);
router.post('/', authenticate, verifyType(['cliente', 'instructor']), verifyRole(['instructor', 'cliente']), createEncargo);
router.post('/elements', authenticate, verifyType(['cliente', 'instructor']), verifyRole(['instructor', 'cliente']), addElementsEncargo);
router.get('/aceptados', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, encargosAceptados);
router.post('/aceptar/:idencargo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, acceptEncargo);
router.post('/reclamar/:idencargo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, reclaimEncargo);
router.post('/rechazar/:idencargo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, rejectEncargo);
router.post('/cancel-aceptar/:idencargo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']),verifyArea, cancelAceptar);
router.delete('/:idencargo', authenticate, verifyType(['cliente', 'instructor']), verifyRole(['instructor', 'cliente']), cancelEncargo);
router.delete('/eliminar/:idencargo', authenticate, verifyType(['cliente', 'instructor']), verifyRole(['instructor', 'cliente']), deleteEncargo);
router.get('/persona/:idencargo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, findEncargoElements);
router.post('/noReclamo/:idencargo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, noReclamarEncargo);
router.post('/finalizar/:idencargo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, finalizarEncargo);

export default router;