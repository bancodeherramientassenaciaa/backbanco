import { Router } from 'express';
import { getAllAdmins, getAdminById, createAdmin, updateAdmin, deleteAdmin, changeContrasenaAdmin, changeCorreoAdmin, getInfoAdmin } from '../controllers/administradorController.js';
import { authenticate, verifyType, verifyRole } from '../middlewares/auth/authMiddleware.js';

const router = Router();

router.get('/info-admin', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante', 'supervisor']), getInfoAdmin);
router.get('/', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante', 'supervisor']), getAllAdmins);
router.get('/:documento', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante', 'supervisor']), getAdminById);
router.post('/', authenticate, verifyType(['administrador']), verifyRole(['admin', 'supervisor']), createAdmin);
router.put('/cambiar-contrasena', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante', 'supervisor']), changeContrasenaAdmin);
router.put('/cambiar-correo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante', 'supervisor']), changeCorreoAdmin);
router.put('/:documento', authenticate, verifyType(['administrador']), verifyRole(['admin', 'supervisor']), updateAdmin);
router.delete('/:documento', authenticate, verifyType(['administrador']), verifyRole(['admin', 'supervisor']), deleteAdmin);

export default router;
