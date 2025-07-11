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

// ✅ Endpoint simplificado de prueba para restablecer contraseña
router.post('/restablecer-test', (req, res) => {
    console.log('🔍 restablecer-test llamado:', req.body);
    res.json({ 
        mensaje: 'Endpoint de restablecer funcionando', 
        body: req.body,
        timestamp: new Date() 
    });
});

// ✅ Endpoint para restablecer contraseña SIN SMTP (para testing)
router.post('/restablecer-sin-smtp', async (req, res) => {
    console.log('🔍 restablecer-sin-smtp llamado:', req.body);
    
    try {
        // Llamar directamente al controlador real
        await resetContrasena(req, res);

    } catch (error) {
        console.error('❌ Error en restablecer-sin-smtp:', error);
        return res.status(500).json({ mensaje: 'Error en prueba sin SMTP' });
    }
});

export default router;
