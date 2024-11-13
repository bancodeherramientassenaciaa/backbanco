import { Router } from 'express';
import { getAllAreas, getAreaById, createArea, updateArea, deleteArea } from '../controllers/areaController.js';
import { authenticate, verifyType, verifyRole, verifyArea } from '../middlewares/auth/authMiddleware.js';

const router = Router();

router.get('/:idarea', authenticate, verifyType(['administrador']), verifyRole(['supervisor']), verifyArea, getAreaById);
router.get('/', authenticate, verifyType(['administrador', 'cliente']), verifyRole(['supervisor', 'instructor', 'admin']),  getAllAreas);
router.post('/', authenticate, verifyType(['administrador']), verifyRole(['supervisor']), createArea);
router.put('/:idarea', authenticate, verifyType(['administrador']), verifyRole(['supervisor']), updateArea);
router.delete('/:idarea', authenticate, verifyType(['administrador']), verifyRole(['supervisor']), deleteArea);

export default router;