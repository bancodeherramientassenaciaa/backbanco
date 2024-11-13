import { Router } from 'express';
import { getAllClients, getClientById, createClient, updateClient, deleteClient, getInfoClient, changeContrasenaClient, changeCorreoClient } from '../controllers/clienteController.js';
import { authenticate, verifyType, verifyRole } from '../middlewares/auth/authMiddleware.js';

const router = Router();

router.get('/info-cliente', authenticate, verifyType(['cliente']), verifyRole(['instructor']), getInfoClient);
router.get('/', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), getAllClients);
router.get('/:documento', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), getClientById);
router.put('/cambiar-contrasena', authenticate, verifyType(['cliente']), verifyRole(['instructor']), changeContrasenaClient);
router.put('/cambiar-correo', authenticate, verifyType(['cliente']), verifyRole(['instructor']), changeCorreoClient);
router.post('/', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), createClient);
router.put('/:documento', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), updateClient);
router.delete('/:documento', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), deleteClient);

export default router;