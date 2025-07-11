import { Router } from 'express';
import login from '../../controllers/auth/login.js';
import { authenticate } from '../../middlewares/auth/authMiddleware.js';

const router = Router();

// Manejar preflight OPTIONS explícitamente
router.options('/', (req, res) => {
  res.status(200).end();
});

router.get('/', (req, res) => {
  res.json({ message: 'Login route funcionando correctamente' });
});

router.post('/', login);

router.get('/validate-token', authenticate, (req, res) => {
  res.status(200).json({ message: 'Token válido' });
});

export default router;
