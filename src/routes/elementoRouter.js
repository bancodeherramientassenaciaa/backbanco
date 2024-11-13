import { Router } from 'express';
import { getAllElements, getElementById, getElementByName, createElement, updateElement, deleteElement, getElementByNameInstructor } from '../controllers/elementoController.js';
import { authenticate, verifyType, verifyRole, verifyArea } from '../middlewares/auth/authMiddleware.js';

const router = Router();

router.get('/by-id/:idelemento', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, getElementById); 
router.get('/by-description/:descripcion', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, getElementByName);
router.get('/by-description/instructor/:descripcion', authenticate, verifyType(['cliente']), verifyRole(['instructor']), getElementByNameInstructor); 
router.get('/', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, getAllElements);
router.post('/', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, createElement);
router.put('/:idelemento', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, updateElement);
router.delete('/:idelemento', authenticate, verifyType(['administrador']), verifyRole(['admin']), verifyArea, deleteElement);

export default router;