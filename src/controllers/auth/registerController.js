// controllers/auth/registerController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AdministradorModel } from '../../models/administradorModel.js';
import config from '../../config/config.js';

export const registerFirstAdmin = async (req, res) => {
    try {
        const { documento, nombre, apellido, contrasena, email } = req.body;

        // Verificar que no existan administradores (solo permitir registro si es el primer deploy)
        const adminCount = await AdministradorModel.count();
        if (adminCount > 0) {
            return res.status(403).json({
                mensaje: 'Ya existen usuarios registrados. El registro está deshabilitado.'
            });
        }

        // Validar que todos los campos requeridos estén presentes
        if (!documento || !nombre || !apellido || !contrasena || !email) {
            return res.status(400).json({
                mensaje: 'Todos los campos son obligatorios'
            });
        }

        // Verificar si ya existe un usuario con ese documento
        const existingAdmin = await AdministradorModel.findOne({
            where: { documento: documento }
        });

        if (existingAdmin) {
            return res.status(400).json({
                mensaje: 'Ya existe un usuario con ese número de documento'
            });
        }

        // Verificar si ya existe un usuario con ese email
        const existingEmail = await AdministradorModel.findOne({
            where: { email: email }
        });

        if (existingEmail) {
            return res.status(400).json({
                mensaje: 'Ya existe un usuario con ese email'
            });
        }

        // Encriptar la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

        // Crear el primer administrador
        const newAdmin = await AdministradorModel.create({
            documento,
            nombre,
            apellido,
            contrasena: hashedPassword,
            email,
            rol_id: 1, // Asumiendo que rol_id 1 es administrador
            estado: 'activo'
        });

        // Generar token JWT
        const token = jwt.sign(
            { 
                id: newAdmin.id, 
                documento: newAdmin.documento,
                role: 'admin' 
            },
            config.jwt.secret,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            mensaje: 'Primer administrador registrado exitosamente',
            token: token,
            usuario: {
                id: newAdmin.id,
                documento: newAdmin.documento,
                nombre: newAdmin.nombre,
                apellido: newAdmin.apellido,
                email: newAdmin.email,
                rol: 'admin'
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            mensaje: 'Error interno del servidor',
            error: error.message
        });
    }
};
