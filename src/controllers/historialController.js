import { Historial, Cliente, Elemento } from '../models/index.js';
import { ajustarHora, formatFecha } from './auth/adminsesionController.js';

const obtenerHoraActual = () => ajustarHora(new Date());

// REGISTRAR UN HISTORIAL
const createRecord = async (areaId, tipoEntidad, entidadId, adminId, clienteId, clienteNombre, elementoId, descripcion, Cantidad, Observaciones, Estado, Accion) => {
    try{

        await Historial.create({
            area_id: areaId,
            tipo_entidad: tipoEntidad, 
            entidad_id: entidadId,
            admin_id: adminId,
            cliente_id: clienteId,
            cliente_nombre: clienteNombre,
            elemento_id: elementoId,
            elemento_descripcion: descripcion,
            cantidad: Cantidad,
            observaciones: Observaciones,
            estado: Estado,
            accion: Accion,
            fecha_accion: obtenerHoraActual()
        });
    } catch(error) {
        console.log(error)
    }      
};

// OBTENER TODOS LOS REGISTROS DEL HISTORIAL
const getAllRecord = async (req, res) => {
    try {
        const area = req.area; 
        const historiales = await Historial.findAll({ where: { area_id: area }, order: [['fecha_accion', 'DESC']] });

        const historialFormateado = await Promise.all(historiales.map(async (historial) => {

            const fechaAccion = formatFecha(historial.fecha_accion, 5);

            return {
                ...historial.dataValues,
                fecha_accion: fechaAccion,
            };
        }));

        res.json(historialFormateado); 
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensaje: 'Error al obtener el historial', error });
    }
};

// OBTENER TODOS LOS REGISTROS DEL HISTORIAL DE LOS ENCARGOS
const getAllRecordEncargo = async (req, res) => {
    try {
        const area = req.area; 
        const historiales = await Historial.findAll({ where: { area_id: area, tipo_entidad: 'encargo' }, order: [['fecha_accion', 'DESC']] });

        const historialFormateado = await Promise.all(historiales.map(async (historial) => {

            const fechaAccion = formatFecha(historial.fecha_accion, 5);

            return {
                ...historial.dataValues,
                fecha_accion: fechaAccion,
            };
        }));

        res.json(historialFormateado); 
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensaje: 'Error al obtener el historial', error });
    }
};

// OBTENER TODOS LOS REGISTROS DEL HISTORIAL DE LOS PRESTAMOS
const getAllRecordPrestamo = async (req, res) => {
    try {
        const area = req.area; 
        const historiales = await Historial.findAll({ where: { area_id: area, tipo_entidad: 'prestamo' }, order: [['fecha_accion', 'DESC']] });

        const historialFormateado = await Promise.all(historiales.map(async (historial) => {

            const fechaAccion = formatFecha(historial.fecha_accion, 5);

            return {
                ...historial.dataValues,
                fecha_accion: fechaAccion,
            };
        }));

        res.json(historialFormateado); 
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensaje: 'Error al obtener el historial', error });
    }
};

// OBTENER TODOS LOS REGISTROS DEL HISTORIAL DE LOS CONSUMOS
const getAllRecordConsumo = async (req, res) => {
    try {
        const area = req.area; 
        const historiales = await Historial.findAll({ where: { area_id: area, tipo_entidad: 'consumo' }, order: [['fecha_accion', 'DESC']] });

        const historialFormateado = await Promise.all(historiales.map(async (historial) => {

            const fechaAccion = formatFecha(historial.fecha_accion, 5);

            return {
                ...historial.dataValues,
                fecha_accion: fechaAccion,
            };
        }));

        res.json(historialFormateado); 
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensaje: 'Error al obtener el historial', error });
    }
};

// OBTENER TODOS LOS REGISTROS DEL HISTORIAL DE LAS MORAS 
const getAllRecordMora = async (req, res) => {
    try {
        const area = req.area; 
        const historiales = await Historial.findAll({ where: { area_id: area, tipo_entidad: 'mora' }, order: [['fecha_accion', 'DESC']] });

        const historialFormateado = await Promise.all(historiales.map(async (historial) => {

            const fechaAccion = formatFecha(historial.fecha_accion, 5);

            return {
                ...historial.dataValues,
                fecha_accion: fechaAccion,
            };
        }));

        res.json(historialFormateado); 
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensaje: 'Error al obtener el historial', error });
    }
};

// OBTENER TODOS LOS REGISTROS DEL HISTORIAL DE LOS DAÑOS 
const getAllRecordDano = async (req, res) => {
    try {
        const area = req.area; 
        const historiales = await Historial.findAll({ where: { area_id: area, tipo_entidad: 'daño' }, order: [['fecha_accion', 'DESC']] });

        const historialFormateado = await Promise.all(historiales.map(async (historial) => {

            const fechaAccion = formatFecha(historial.fecha_accion, 5);

            return {
                ...historial.dataValues,
                fecha_accion: fechaAccion,
            };
        }));

        res.json(historialFormateado); 
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensaje: 'Error al obtener el historial', error });
    }
};

// OBTENER TODOS LOS REGISTROS DEL HISTORIAL DE LOS TRASPASOS
const getAllRecordTraspaso= async (req, res) => {
    try {
        const area = req.area; 
        const historiales = await Historial.findAll({ where: { area_id: area, tipo_entidad: 'traspaso' }, order: [['fecha_accion', 'DESC']] });

        const historialFormateado = await Promise.all(historiales.map(async (historial) => {

            const fechaAccion = formatFecha(historial.fecha_accion, 5);

            return {
                ...historial.dataValues,
                fecha_accion: fechaAccion,
            };
        }));

        res.json(historialFormateado); 
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensaje: 'Error al obtener el historial', error });
    }
};

// OBTENER TODOS LOS REGISTROS DEL HISTORIAL DE LOS REINTEGROS
const getAllRecordReintegro = async (req, res) => {
    try {
        const area = req.area; 
        const historiales = await Historial.findAll({ where: { area_id: area, tipo_entidad: 'reintegro' }, order: [['fecha_accion', 'DESC']] });

        const historialFormateado = await Promise.all(historiales.map(async (historial) => {

            const fechaAccion = formatFecha(historial.fecha_accion, 5);

            return {
                ...historial.dataValues,
                fecha_accion: fechaAccion,
            };
        }));

        res.json(historialFormateado); 
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensaje: 'Error al obtener el historial', error });
    }
};


// OBTENER TODOS LOS REGISTROS DEL HISTORIAL DE LOS REINTEGROS
const getAllRecordPrestamoEs = async (req, res) => {
    try {
        const area = req.area; 
        const historiales = await Historial.findAll({ where: { area_id: area, tipo_entidad: 'prestamoes' }, order: [['fecha_accion', 'DESC']] });

        const historialFormateado = await Promise.all(historiales.map(async (historial) => {

            const fechaAccion = formatFecha(historial.fecha_accion, 5);

            return {
                ...historial.dataValues,
                fecha_accion: fechaAccion,
            };
        }));

        res.json(historialFormateado); 
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensaje: 'Error al obtener el historial', error });
    }
};

export { getAllRecord, createRecord, getAllRecordEncargo, getAllRecordPrestamo, getAllRecordMora, getAllRecordDano, getAllRecordReintegro, getAllRecordTraspaso, getAllRecordConsumo, getAllRecordPrestamoEs };