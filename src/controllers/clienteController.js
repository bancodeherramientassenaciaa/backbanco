import { Cliente, Rol } from '../models/index.js';
import upload from '../middlewares/fotoClienteMiddleware.js';
import bcrypt from 'bcryptjs';
import validator from 'validator';

// Obtener todos los Clientes
const getAllClients = async (req, res) => {
    try {
        const users = await Cliente.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.mensaje });
    }
};

// Obtener un Cliente por documento
const getClientById = async (req, res) => {
    try {
        const user = await Cliente.findByPk(req.params.documento);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ mensaje: 'El Cliente ingresado no existe' });
        }
    } catch (error) {
        res.status(500).json({ error: error.mensaje });
    }
};

// Crear un nuevo Cliente
const createClient = async (req, res) => {
    try {
        // Manejar la carga de archivos
        upload.single('foto')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.mensaje });
            }

            const userExisting = await Cliente.findByPk(req.body.documento);
            if (userExisting) {
                return res.status(400).json({ mensaje: 'El Cliente ingresado ya existe' });
            }

            if (req.body.contrasena !== '') {
                req.body.contrasena = await bcrypt.hash(req.body.contrasena, 10);
            }

            const rolMissing = await req.body.roles_idrol;

            if( rolMissing == '') {
                return res.status(400).json({ mensaje: 'El rol del cliente no puede estar vacío'});
            }

            const rolExist = await Rol.findByPk(req.body.roles_idrol);

            if(!rolExist) {
                return res.status(400).json({ mensaje: 'El rol ingresado no existe' });
            }

            // Obtener el nombre del archivo de la imagen subida
            const foto = req.file ? req.file.filename : null;
            if(rolExist.descripcion !== 'instructor' && req.body.contrasena) {
                return res.status(400).json({ mensaje: 'Solo si es instructor puede registrar contraseña' });
            }

            if (req.body.fechaInicio >= req.body.fechaFin) {
                return res.status(400).json({ mensaje: 'La fecha de inicio no puede ser más reciente que la fecha de fin' });
            }

            const user = await Cliente.create({ ...req.body, foto });
            res.status(201).json(user);
        });
    } catch (error) {
        res.status(400).json({ error: error.mensaje });
    }
}

// Actualizar un Cliente
const updateClient = async (req, res) => {
    try {
        // Manejar la carga de archivos (si se proporciona una nueva imagen)
        upload.single('foto')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ mensaje: 'Error al guardar cambios, por favor recargue la página' });
            }

            // Verificar si el cliente existe
            const client = await Cliente.findByPk(req.body.documento);
            if (!client) {
                return res.status(404).json({ mensaje: 'El Cliente no existe' });
            }

            // Verificar si el rol está vacío
            const rolMissing = req.body.roles_idrol;
            if (rolMissing === '') {
                return res.status(400).json({ mensaje: 'El rol del cliente no puede estar vacío' });
            }

            // Verificar si el rol existe
            const rolExist = await Rol.findByPk(req.body.roles_idrol);
            if (!rolExist) {
                return res.status(400).json({ mensaje: 'El rol ingresado no existe' });
            }

            if (rolExist.descripcion !== 'instructor') {
                client.update({contrasena: ''});
            }

            if (rolExist.descripcion == 'instructor' && req.body.contrasena.trim() == '') {
                return res.status(400).json({ mensaje: 'No puedes poner espacios como contraseña' });
            }
            // Si hay una nueva contraseña, encriptarla
            if (req.body.contrasena && req.body.contrasena.trim() !== '') {
                req.body.contrasena = await bcrypt.hash(req.body.contrasena, 10);
            } else {
                // Mantener la contraseña actual si no se ha proporcionado una nueva
                req.body.contrasena = client.contrasena;
            }

            // Obtener el nombre del archivo de la imagen subida, si existe una nueva imagen
            const foto = req.file ? req.file.filename : client.foto; // Mantener la imagen anterior si no se subió una nueva

            // Actualizar el cliente con los nuevos datos
            await client.update({ ...req.body, foto });

            res.status(200).json({ mensaje: 'Cliente actualizado correctamente', client });
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar el cliente, por favor recargue la página' });
    }
};

// Eliminar un Cliente
const deleteClient = async (req, res) => {
    try {
        const deleted = await Cliente.destroy({
            where: { documento: req.params.documento }
        });
        if (deleted) {
            res.status(200).json({ mensaje: 'Cliente eliminado correctamente' });
            // el 204 indica que el servidor ha recibido la solicitud con éxito, pero no devuelve ningún contenido.
        } else {
            res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.mensaje });
    }
};

// Obtener la info de un cliente
const getInfoClient = async (req, res) => {
    try {
        const { id: clienteId } = req.user;
        const user = await Cliente.findOne({ where: {documento: clienteId}});
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.mensaje });
    }
}

// Instructor acmbia su correo o número
const changeCorreoClient = async (req, res) => {
    try {
        const { id: clienteId } = req.user;
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
        const user = await Cliente.update({correo: correo, numero: numero},{ where: {documento: clienteId}});
        if (user) {
            return res.status(200).json({mensaje: 'Correo actualizado correctamente'});
        } else {
            return res.status(400).json({mensaje: 'Cliente no encontrado'})
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.mensaje });
    }
}

// Instructor cambia su contraseña
const changeContrasenaClient = async (req, res) => {
    try {
        const { id: clienteId } = req.user;
        let contrasena = req.body.contrasena
        if (contrasena == '' || contrasena == undefined || contrasena == null) {
            return res.status(400).json({mensaje: 'No puedes enviar una contraseña vacía'});
        } 
        contrasena = await bcrypt.hash(contrasena, 10);
        const user = await Cliente.update({ contrasena: contrasena}, { where: {documento: clienteId}});
        if (user) {
            return res.status(200).json({mensaje: 'Contraseña actualizada correctamente'});
        } else {
            return res.status(400).json({mensaje: 'Cliente no encontrado'})
        }
    } catch (error) {
        res.status(500).json({ error: error.mensaje });
    }
}

export { getAllClients, getClientById, createClient, updateClient, deleteClient, getInfoClient, changeContrasenaClient, changeCorreoClient };