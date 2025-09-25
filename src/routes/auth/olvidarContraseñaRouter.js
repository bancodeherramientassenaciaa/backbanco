import { Router } from 'express';
import { solicitarNuevaContrasena, resetContrasena } from '../../controllers/auth/olvidarContrasenaController.js';

const router = Router();

router.post('/solicitar-restablecer', solicitarNuevaContrasena);
router.post('/restablecer-constrasena', resetContrasena);

export default router;