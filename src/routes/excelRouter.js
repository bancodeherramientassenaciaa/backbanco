
import express from 'express';
import upload from '../middlewares/excelMiddleware.js'; // Middleware para subir Excel
import { authenticate, verifyType, verifyRole } from '../middlewares/auth/authMiddleware.js';
import { uploadExcelClienteData, uploadExcelElementoData } from '../controllers/importarExcelController.js';
import { exportarTodoExcel } from '../controllers/exportarExcelController.js';
import { exportarTodoXlsx } from '../controllers/exportarCompleto.js'; // Usando la nueva implementación

const router = express.Router();


// Ruta para subir y procesar el archivo Excel
router.post('/cliente', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), upload.single('file'), uploadExcelClienteData);
router.post('/elemento', authenticate, verifyType(['administrador']), verifyRole(['admin', 'contratista', 'practicante']), upload.single('file'), uploadExcelElementoData);

// Middleware para verificar el token como query parameter
const checkTokenParam = (req, res, next) => {
  try {
    // Si hay un token en query param, usarlo en headers
    if (req.query.token) {
      req.headers.authorization = `Bearer ${req.query.token}`;
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Rutas para exportar toda la información a Excel (solo rol admin)
router.get('/exportar-todo', checkTokenParam, authenticate, verifyType(['administrador']), verifyRole(['admin']), exportarTodoXlsx);

// Ruta adicional usando el wrapper para mantener compatibilidad
router.get('/exportar', checkTokenParam, authenticate, verifyType(['administrador']), verifyRole(['admin']), exportarTodoExcel);

export default router;
