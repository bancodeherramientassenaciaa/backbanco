import { Router } from 'express';
import {
  solicitarNuevaContrasena,
  resetContrasena
} from '../../controllers/auth/olvidarContrasenaController.js';

const router = Router();

// ✅ Endpoint de prueba para verificar que el router funciona
router.get('/test', (req, res) => {
    res.json({ mensaje: 'Router de olvidar contraseña funcionando correctamente', timestamp: new Date() });
});

// ✅ Endpoint de prueba POST para verificar que el método POST funciona
router.post('/test-post', (req, res) => {
    res.json({ 
        mensaje: 'POST funciona correctamente', 
        body: req.body,
        timestamp: new Date() 
    });
});

// Endpoint para solicitar el envío de correo con token
router.post('/solicitar-restablecer', solicitarNuevaContrasena);

// ✅ Endpoint para restablecer la contraseña (nombre corregido)
router.post('/restablecer-contrasena', resetContrasena);

export default router;
