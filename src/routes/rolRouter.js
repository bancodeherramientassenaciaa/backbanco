import { Router } from 'express';
import { getAllRoles, getRoleById, createRole, updateRole, deleteRole } from '../controllers/rolController.js';
import { authenticate, verifyType, verifyRole } from '../middlewares/auth/authMiddleware.js';

const router = Router();

router.get('/:idrol', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), getRoleById);
router.get('/', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), getAllRoles);
router.post('/', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), createRole);
router.put('/:idrol', authenticate, verifyType(['administrador']), verifyRole(['admin']), updateRole);
router.delete('/:idrol', authenticate, verifyType(['administrador']), verifyRole(['admin']), deleteRole);

export default router;