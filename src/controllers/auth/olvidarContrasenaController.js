import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import config from '../../config/config.js';
import { Cliente, Administrador, Rol } from '../../models/index.js';

const sendRecoveryEmail = async (email, link) => {
    // Configurar el transportador de nodemailer
    const transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port, // Usar 587 para conexiones seguras
        secure: false, // true para 465, false para otros puertos
        auth: {
            user: config.email.user,
            pass: config.email.pass,
        },
    });

    await transporter.sendMail({
        to: email,
        subject: 'Restablecimiento de contraseña Banco de Herramientas',
        text: `Haz clic en este enlace para restablecer tu contraseña: ${link}`,
    });
};

// Función para solicitar nueva contraseña
const solicitarNuevaContrasena = async (req, res) => {
    try {
        const { correo, documento } = req.body;
        let usuario = '';

        if (!correo || !documento) {
            return res.status(400).json({ mensaje: 'Correo y documento son requeridos.' });
        }

        const admin = await Administrador.findOne({ where: { documento } });
        const client = await Cliente.findOne({ where: { documento } });

        if (admin) {
            if (admin.correo !== correo) {
                return res.status(400).json({ mensaje: 'El correo ingresado no coincide con el registrado' });
            } else {
                usuario = admin;
            }
        } else if (client) {
            const rol = await Rol.findOne({ where: { idrol: client.roles_idrol } });

            if (rol.descripcion !== 'instructor') {
                return res.status(400).json({ mensaje: 'No tienes acceso' });
            }

            if (client.correo !== correo) {
                return res.status(400).json({ mensaje: 'El correo ingresado no coincide con el registrado' });
            } else {
                usuario = client;
            }
        } else {
            return res.status(400).json({ mensaje: 'El documento ingresado no existe' });
        }

        const token = jwt.sign(
            {
                correo: usuario.correo,
                documento: usuario.documento,
                date: Date.now(),
            },
            config.jwt.secretnewcontrasena,
            { expiresIn: '10m' }
        );

        if (token) {
            const recoveryLink = `http://frontbanco.vercel.app/restablecer-contrasena/${token}`;
            await sendRecoveryEmail(usuario.correo, recoveryLink);
        }

        return res.status(200).json({
            mensaje: 'Se ha enviado un correo con el link de recuperación. Revisa tu bandeja de entrada, en caso de no encontrarlo revisa los correos no deseados o Spam'
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensaje: 'Error al enviar la solicitud de restablecer contraseña, por favor vuelva a intentarlo' });
    }
};

// Función para resetear la contraseña
const resetContrasena = async (req, res) => {
    try {
        const { token, nuevaContrasena } = req.body;

        if (!nuevaContrasena) {
            return res.status(400).json({ mensaje: 'La contraseña está vacía, por favor ingresa la nueva contraseña' });
        }

        // ✅ Verifica el token usando try/catch (no callback)
        const decoded = jwt.verify(token, config.jwt.secretnewcontrasena);

        let usuario = '';

        const admin = await Administrador.findOne({ where: { documento: decoded.documento } });
        const client = await Cliente.findOne({ where: { documento: decoded.documento } });

        if (admin) {
            if (admin.correo !== decoded.correo) {
                return res.status(400).json({ mensaje: 'El correo ingresado no coincide con el registrado' });
            } else {
                usuario = admin;
            }
        } else if (client) {
            const rol = await Rol.findOne({ where: { idrol: client.roles_idrol } });

            if (rol.descripcion !== 'instructor') {
                return res.status(400).json({ mensaje: 'No tienes acceso' });
            }

            if (client.correo !== decoded.correo) {
                return res.status(400).json({ mensaje: 'El correo ingresado no coincide con el registrado' });
            } else {
                usuario = client;
            }
        } else {
            return res.status(400).json({ mensaje: 'El usuario al que intenta cambiar la contraseña no existe' });
        }

        usuario.contrasena = await bcrypt.hash(nuevaContrasena, 10);
        await usuario.save();

        return res.status(200).json({ mensaje: "Contraseña actualizada con éxito." });

    } catch (error) {
        console.log(error);

        // Manejo específico de errores de JWT
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ mensaje: "El link ha expirado. Solicita uno nuevo." });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ mensaje: "Token inválido." });
        }

        return res.status(500).json({ mensaje: 'Error al crear la nueva contraseña, por favor vuelva a intentarlo' });
    }
};

export { solicitarNuevaContrasena, resetContrasena };
