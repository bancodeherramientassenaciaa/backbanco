import { Router } from 'express';
import { getAllRecord, getAllRecordEncargo, getAllRecordPrestamo, getAllRecordDano, getAllRecordMora, getAllRecordReintegro, getAllRecordTraspaso, getAllRecordConsumo, getAllRecordPrestamoEs } from '../controllers/historialController.js';
import { authenticate, verifyType, verifyRole, verifyArea } from '../middlewares/auth/authMiddleware.js';

const router = Router();

router.get('/', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, getAllRecord); 
router.get('/encargo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, getAllRecordEncargo); 
router.get('/prestamo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, getAllRecordPrestamo); 
router.get('/prestamoEs', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, getAllRecordPrestamoEs); 
router.get('/mora', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, getAllRecordMora); 
router.get('/dano', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, getAllRecordDano); 
router.get('/traspaso', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, getAllRecordTraspaso); 
router.get('/reintegro', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, getAllRecordReintegro); 
router.get('/consumo', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), verifyArea, getAllRecordConsumo); 

export default router;