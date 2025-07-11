// controllers/auth/checkFirstDeployController.js
import Administrador from '../../models/administradorModel.js';

export const checkFirstDeploy = async (req, res) => {
    try {
        // Verificar si existe al menos un administrador en la base de datos
        const adminCount = await Administrador.count();
        
        // Si no hay administradores, es el primer deploy
        const isFirstDeploy = adminCount === 0;
        
        res.json({
            isFirstDeploy,
            message: isFirstDeploy 
                ? 'No hay usuarios registrados. Mostrando formulario de registro.' 
                : 'Ya existen usuarios. Mostrando formulario de login.'
        });
    } catch (error) {
        console.error('Error al verificar primer deploy:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            isFirstDeploy: false // Por seguridad, si hay error mostramos login
        });
    }
};
