import { Router } from 'express';
import { createConsumption, addElements, getAllConsumptions, deleteConsumption, clienteData } from '../controllers/consumoController.js';
import { authenticate, verifyType, verifyRole } from '../middlewares/auth/authMiddleware.js';

const router = Router();

router.post('/', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), createConsumption);
router.post('/addElements/:idconsumo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), addElements);
router.get('/', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), getAllConsumptions);
router.delete('/:idconsumo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), deleteConsumption);
router.get('/datosCliente/:idconsumo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), clienteData);

export default router;
