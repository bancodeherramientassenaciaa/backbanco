import { Administrador, Area } from '../models/index.js';
import bcrypt from 'bcryptjs';
import validator from 'validator';

// Obtener todos los Administradores
const getAllAdmins = async (req, res) => {
    try {
        const { area } = req.user;
        let admins = await Administrador.findAll({where: {areas_idarea: area}});
        if (area == 0) {
            admins = await Administrador.findAll();
        }
        res.json(admins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener un Administrador por documento
const getAdminById = async (req, res) => {
    try {
        const admin = await Administrador.findByPk(req.params.documento);
        if (admin) {
            res.json(admin);
        } else {
            res.status(404).json({ mensaje: 'El Administrador ingresado no existe' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear un nuevo Administrador
const createAdmin = async (req, res) => {
    try {
        const { area } = req.user;
        const areaFormSupervisor = req.body.areas_idarea;
        const adminExisting = await Administrador.findByPk(req.body.documento);

        if(!adminExisting) { 
            if (req.body.contrasena !== '') {
                req.body.contrasena = await bcrypt.hash(req.body.contrasena, 10);
            }

            if (area == 0) {
                await Administrador.create({...req.body, areas_idarea: areaFormSupervisor});
            } else {
                await Administrador.create({...req.body, areas_idarea: area});
            }
                
            res.status(200).json({mensaje: 'Administrador registrado correctamente'});
        } else {
            res.status(400).json({ mensaje: 'El Administrador que intenta crear ya existe' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 

// Actualizar un Administrador
const updateAdmin = async (req, res) => {
    try {
        const { area } = req.user;
        const admin = await Administrador.findByPk(req.params.documento);
        let updated;

        if (!admin) {
            return res.status(404).json({ mensaje: 'Administrador no encontrado' });
        }

        const isSameData = Object.keys(req.body).every(key => admin[key] === req.body[key]);

        if (isSameData) {
            return res.status(400).json({ mensaje: 'No se ha hecho ningún cambio en el Administrador' });
        }

        if (area == 0) {
            [updated] = await Administrador.update(req.body, {
                where: { documento: req.params.documento }
            });
        } else {
            [updated] = await Administrador.update(req.body, {
                where: { documento: req.params.documento, areas_idarea: area }
            });
        }

        if (updated) {
            const updatedUser = await Administrador.findByPk(req.params.documento);
            res.json(updatedUser);
        } else {
            res.status(500).json({ mensaje: 'Error al actualizar el Administrador, por favor vuelva a intentarlo' });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error inesperado, vuelva a intentarlo' });
    }
};

// Eliminar un Administrador
const deleteAdmin = async (req, res) => {
    try {
        const { area } = req.user;
        
        if (area == 0) {
            await Administrador.destroy({
                where: { documento: req.params.documento }
            });
        } else  {
            await Administrador.destroy({
                where: { documento: req.params.documento, areas_idarea: area }
            });
        }

        res.status(200).json({ mensaje: 'Administrador eliminado correctamente' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener la info de un admin
const getInfoAdmin = async (req, res) => {
    try {
        const { id: adminId } = req.user;
        const user = await Administrador.findOne({ where: {documento: adminId}});
        const area = await Area.findOne({where: {idarea: user.areas_idarea}});
        const administrador = {...user.dataValues, area: area.nombre};
        res.json(administrador);
    } catch (error) {
        res.status(500).json({ error: error.mensaje });
    }
}

// Admin acmbia su correo o número
const changeCorreoAdmin = async (req, res) => {
    try {
        const { id: adminId } = req.user;
        let correo = req.body.correo;
        const numero = req.body.numero;
        // Validar el formato del correo
        if (typeof correo !== 'string') {
            correo = String(correo); // Convertir a cadena si es necesario
        }
        if (!correo || !validator.isEmail(correo)) {
            return res.status(400).json({mensaje: 'El correo no puede estar vacío y debe tener un formato válido'})
        }
        if (!numero) {
            return res.status(400).json({mensaje: 'El número no puede estar vacío y debe tener un formato válido'})
        }
        const user = await Administrador.update({correo: correo, numero: numero},{ where: {documento: adminId}});
        if (user) {
            return res.status(200).json({mensaje: 'Correo actualizado correctamente'});
        } else {
            return res.status(400).json({mensaje: 'Admin no encontrado'})
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.mensaje });
    }
}

// Admin cambia su contraseña
const changeContrasenaAdmin = async (req, res) => {
    try {
        const { id: adminId } = req.user;
        let contrasena = req.body.contrasena
        if (contrasena == '' || contrasena == undefined || contrasena == null) {
            return res.status(400).json({mensaje: 'No puedes enviar una contraseña vacía'});
        } 
        contrasena = await bcrypt.hash(contrasena, 10);
        const user = await Administrador.update({ contrasena: contrasena}, { where: {documento: adminId}});
        if (user) {
            return res.status(200).json({mensaje: 'Contraseña actualizada correctamente'});
        } else {
            return res.status(400).json({mensaje: 'Admin no encontrado'})
        }
    } catch (error) {
        res.status(500).json({ error: error.mensaje });
    }
}

export { getAllAdmins, getAdminById, createAdmin, updateAdmin, deleteAdmin, getInfoAdmin, changeContrasenaAdmin, changeCorreoAdmin };