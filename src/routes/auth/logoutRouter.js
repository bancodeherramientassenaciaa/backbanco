import { Router } from 'express';
import { terminarSesion } from '../../controllers/auth/adminsesionController.js';

const router = Router();

router.post('/', async (req, res) => {
    const { documento } = req.body;

    try {
        await terminarSesion(documento);
        res.status(200).json({ message: 'Sesión cerrada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al cerrar sesión', error });
    }
});

export default router;
