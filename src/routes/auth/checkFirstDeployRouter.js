// routes/auth/checkFirstDeployRouter.js
import { Router } from 'express';
import { checkFirstDeploy } from '../../controllers/auth/checkFirstDeployController.js';

const router = Router();

router.get('/', checkFirstDeploy);

export default router;
