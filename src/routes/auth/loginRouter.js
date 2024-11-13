import { Router } from 'express';
import login from '../../controllers/auth/login.js';
import { authenticate, verifyType, verifyRole } from '../../middlewares/auth/authMiddleware.js';

const router = Router();

router.post('/', login);
router.get('/validate-token', authenticate, (req, res) => {
    res.status(200).json({ message: 'Token válido' });
});

export default router;