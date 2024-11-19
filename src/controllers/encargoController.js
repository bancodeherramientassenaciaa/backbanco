import { Op, Sequelize } from 'sequelize';
import { Encargo, ElementoHasEncargo, Cliente, Elemento, Area, PrestamoCorriente, ElementoHasPrestamoCorriente } from '../models/index.js';
import { ajustarHora, formatFecha } from './auth/adminsesionController.js';
import { createRecord } from './historialController.js';

const obtenerHoraActual = () => ajustarHora(new Date());

// INSTRUCTOR CREA EL ENCARGO
const createEncargo = async (req, res) => {
    try {
        const {id: clientes_documento } = req.user;
        const { correo, numero, elementos, fecha_reclamo, areas_idarea } = req.body;
        const clienteExists = await Cliente.findOne({where: {documento: clientes_documento}});
        if (!clienteExists) {
            return res.status(400).json({ mensaje: 'La persona no se encuentra registrada'})
        }

        if (!numero || !correo || !fecha_reclamo || !elementos) {
            return res.status(400).json({ mensaje: 'Debes ingresar todos los datos'})
        }
        // esta constante debe ir después de la validación de arriba porque sino saldrá error de 'Invalid time value' al intentar ajustar la hora en caso de que no se haya indicado la fecha desde el front y sea undefined
        const fechaReclamo = ajustarHora(new Date(fecha_reclamo)); 
        // Obtener la fecha actual en formato 'YYYY-MM-DD'
        const currentDate = new Date().toISOString().split('T')[0];

        // Comparar las fechas (solo la parte de la fecha, sin la hora)
        if (fechaReclamo < currentDate) {
            return res.status(400).json({ mensaje: 'No puedes hacer un encargo para una fecha anterior a la actual' });
        }

        const existeEncargos = await Encargo.findAll({where: {clientes_documento: clientes_documento}});

        const encargo = await Encargo.create({
            clientes_documento: clientes_documento,
            correo: correo,
            numero: numero,
            areas_idarea: areas_idarea,
            fecha_pedido: obtenerHoraActual(),
            fecha_reclamo: fechaReclamo
        });

        const idencargo = encargo.idencargo;
        
        for (let elemento of elementos) {
            const { idelemento, cantidad, observaciones } = elemento;

            const elementoEncontrado = await Elemento.findOne({ where: { idelemento, areas_idarea: areas_idarea }});
            if (!elementoEncontrado) {
                await Encargo.destroy({where: {idencargo: idencargo}});
                return res.status(404).json({ mensaje: `Elemento no encontrado en el inventario` });
            }
            const dispoTotal = elementoEncontrado.cantidad - elementoEncontrado.minimo;
            
            if (existeEncargos) {
                const idDeEncargos = existeEncargos.map((encargo) => encargo.idencargo);
                const elementosYaEncargados = await ElementoHasEncargo.findAll({
                    where: {
                        encargos_idencargo: {
                            [Op.in]: idDeEncargos // Usamos Op.in para buscar en el array
                        },
                        elementos_idelemento: idelemento
                    }
                });
                const estadosDeElementos = elementosYaEncargados.map((elemento) => elemento.estado);
                if (estadosDeElementos.includes('pendiente')) {
                    await Encargo.destroy({where: {idencargo: idencargo}});
                    return res.status(400).json({ mensaje: `Ya tienes el elemento ${elementoEncontrado.descripcion} encargado`});
                }
            }

            if (cantidad <= 0) {
                await Encargo.destroy({where: {idencargo: idencargo}});
                return res.status(400).json({ mensaje: `La cantidad de préstamo no puede ser 0 ni menor que éste`});
            }
        
            const elementoDisponible = await Elemento.findOne({ where: { idelemento, estado: 'disponible', areas_idarea: areas_idarea }});
            if (!elementoDisponible) {
                await Encargo.destroy({where: {idencargo: idencargo}});
                return res.status(404).json({ mensaje: `Elemento ${elementoDisponible.descripcion} agotado` });
            }

            if (dispoTotal < cantidad) {
                await Encargo.destroy({where: {idencargo: idencargo}});
                return res.status(400).json({ mensaje: `La cantidad solicitada del elemento ${elementoDisponible.descripcion} supera la disponibilidad de éste` });
            }

            await ElementoHasEncargo.create({
                elementos_idelemento: idelemento,
                encargos_idencargo: idencargo,
                cantidad,
                observaciones,
                estado: 'pendiente'
            });
        }

        return res.status(200).json({ mensaje: 'Encargo creado con éxito' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ mensaje: 'Error al crear el encargo, por favor vuelva a intentarlo'});
    }
};

// INSTRUCTOR PUEDE CANCELAR ENCARGO SI AÚN ESTABA PENDIENTE
const cancelEncargo = async (req, res) => {
    try {
        const { idencargo } = req.params;
        const { elemento } = req.body; 

        const encargo = await ElementoHasEncargo.findOne({ where: {encargos_idencargo: idencargo, elementos_idelemento: elemento}});  
        if (!encargo) {
            return res.status(400).json({ mensaje: 'El encargo que intenta cancelar no existe'});
        }
        if (encargo.estado == 'aceptado') {
            return res.status(400).json({ mensaje: 'El encargo ya fue aceptado por el banco de herramientas, no puedes cancelarlo, por favor recarga la página'})
        }
        await ElementoHasEncargo.destroy({ where: {encargos_idencargo: idencargo, elementos_idelemento: elemento}});
        const encargos = await ElementoHasEncargo.findAll({ where: {encargos_idencargo: idencargo}});
        if (encargos.length<1) {
            await Encargo.destroy({where: {idencargo: idencargo}});
        }

        res.status(200).json({mensaje: 'Encargo cancelado correctamente'})
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al cancelar el encargo, por favor vuleva a intentarlo' });
    }
};

// PARA OBTENER LOS ENCARGOS DEL INSTRUCTOR DESDE SU PERFIL
const getInstructorEncargos = async (req, res) => {
    try {
        const { id: clientes_documento } = req.user;
        const encargos = await ElementoHasEncargo.findAll({
            include: [
                {
                    model: Encargo,
                    attributes: ['areas_idarea', 'fecha_reclamo'],
                    where: { clientes_documento: clientes_documento },
                    include: [
                        {
                            model: Area, // Asegúrate de que el modelo Area esté importado
                            attributes: ['nombre'] // Cambia 'nombre' por el campo que necesitas
                        }
                    ]
                },
                {
                    model: Elemento,
                    attributes: ['descripcion']
                }
            ]
        });

        const encargosFormateados = encargos.map(encargo => {
            const fechaReclamo = formatFecha(encargo.Encargo.fecha_reclamo, 5); // Asegúrate de acceder a la fecha correctamente
            return {
                ...encargo.dataValues, // Cambia 'prestamo' por 'encargo'
                fecha_reclamo: fechaReclamo,
                area_nombre: encargo.Encargo.Area.nombre // Accediendo al nombre del área
            };
        });

        return res.status(200).json(encargosFormateados);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al obtener los encargos' });
    }
};

// PARA OBTENER LOS ENCARGOS QUE HAYAN EN EL ÁREA DEL ADMIN, DESDE EL PERFIL DEL ADMIN
const getAdminEncargos = async (req, res) => {
    try {
        const { area } = req.user;
        const encargos = await ElementoHasEncargo.findAll({
            include: [
                {
                    model: Encargo,
                    attributes: ['areas_idarea', 'fecha_pedido', 'fecha_reclamo', 'correo', 'numero', 'clientes_documento'],
                    include:[{ model: Cliente, attributes:['nombre']}],
                    where: { areas_idarea: area }
                },
                {
                    model: Elemento,
                    attributes: ['descripcion']
                }
            ],
            where: {
                estado: {
                    [Op.ne]: 'rechazado'  // `Op.ne` significa "no igual"
                }
            }
        });

        const encargosFormateados = encargos.map(encargo => {
            const fechaReclamo = formatFecha(encargo.Encargo.fecha_reclamo, 5);
            const fechaPedido = formatFecha(encargo.Encargo.fecha_pedido, 5); 
            return {
                ...encargo.dataValues, 
                fecha_reclamo: fechaReclamo,
                fecha_pedido: fechaPedido
            };
        });

        return res.status(200).json(encargosFormateados);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al obtener los encargos' });
    }
};

// ADMIN NIEGA/RECHAZA EL ENCRARGO
const rejectEncargo = async (req, res) => {
    try {
        const { area, id: adminId } = req.user;
        const { idencargo } = req.params;
        const { elemento, observaciones } = req.body; 

        const elementoEncontrado = await Elemento.findOne({where: {idelemento: elemento}})
        const encargoEncargo = await Encargo.findOne({ where: {idencargo: idencargo}})
        const documento = encargoEncargo.clientes_documento;
        const cliente = await Cliente.findOne({where: {documento}})
        const encargo = await ElementoHasEncargo.findOne({ where: {encargos_idencargo: idencargo, elementos_idelemento: elemento}});  
        if (!encargo) {
            return res.status(400).json({ mensaje: 'El encargo que intenta rechazar no existe'});
        }
        if (encargo.estado == 'pendiente') {
            await ElementoHasEncargo.update({estado: 'rechazado', observaciones: observaciones}, {where: {encargos_idencargo: idencargo, elementos_idelemento: elemento}});
        }
        createRecord(area,'encargo', idencargo, adminId, documento, cliente.nombre, elemento, elementoEncontrado.descripcion, encargo.cantidad, observaciones, 'rechazado', 'RECHAZAR ENCARGO'); 

        res.status(200).json({mensaje: 'Encargo rechazado correctamente'})
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al rechazar el encargo, por favor vuleva a intentarlo' });
    }
};

// ADMIN RECLAMA EL ENCARGO
const reclaimEncargo = async (req, res) => {
    try {
        const { area, id: adminId } = req.user;
        const { idencargo } = req.params;
        const { elemento, observaciones, cantidad } = req.body; 

        const encargo = await Encargo.findOne({where: {idencargo: idencargo}});
        const documento = encargo.clientes_documento;
        const cliente = await Cliente.findOne({where: {documento}})
        const elementoEncargo = await ElementoHasEncargo.findOne({ where: {encargos_idencargo: idencargo, elementos_idelemento: elemento}}); 
        const elementoEncontrado = await Elemento.findOne({where: {idelemento: elemento}});

        if (!elementoEncargo) {
            return res.status(400).json({ mensaje: 'El encargo que intenta aceptar no existe'});
        }
        if (elementoEncargo.estado == 'aceptado') {
            const loanExisting = await PrestamoCorriente.findOne({
                where: { clientes_documento: documento, estado: 'actual', areas_idarea: area }
            });
            const elementoEncontrado = await Elemento.findOne({where: {idelemento: elemento}});
            const disponibles = elementoEncontrado.disponibles - elementoEncontrado.minimo;

            if(loanExisting) {
                const elementoEnPrestamo = await ElementoHasPrestamoCorriente.findOne({
                    where: {
                        elementos_idelemento: elemento,
                        prestamoscorrientes_idprestamo: loanExisting.idprestamo
                    }
                });
                if (elementoEnPrestamo) {
                    const dispoTotal = elementoEnPrestamo.cantidad + disponibles;
                    if (elementoEnPrestamo.cantidad + cantidad > dispoTotal) {
                        return res.status(400).json({ mensaje: 'No se puede aceptar el préstamo porque supera la cantidad disponible del elemento'})
                    }
                    await ElementoHasPrestamoCorriente.update(
                        { 
                            cantidad: elementoEnPrestamo.cantidad + cantidad, 
                            observaciones: observaciones,
                            fecha_entrega: obtenerHoraActual(),
                        },
                        { where: {elementos_idelemento: elemento, prestamoscorrientes_idprestamo: loanExisting.idprestamo}}
                    );
                    await Elemento.update(
                        {
                            disponibles: elementoEncontrado.disponibles - cantidad,
                            estado: elementoEncontrado.disponibles + cantidad <= elementoEncontrado.minimo ? 'agotado' : 'disponible'
                        },
                        { where: { idelemento: elemento } }
                    ); 
                    // createRecord(area,'prestamo', idprestamo, adminId, prestamo.clientes_documento, elementoEnPrestamo.elementos_idelemento, elementoEncontrado.descripcion, cantidad, observaciones, 'actual', 'AGREGAR ELEMENTO DESDE ENCARGO'); 
                } else {
                    if (cantidad > disponibles) {
                        return res.status(400).json({ mensaje: 'No se puede aceptar el préstamo porque supera la cantidad disponible del elemento'})
                    }
                    await ElementoHasPrestamoCorriente.create({
                        elementos_idelemento: elemento,
                        prestamoscorrientes_idprestamo: loanExisting.idprestamo,
                        cantidad,
                        observaciones,
                        fecha_entrega: obtenerHoraActual(),
                        estado: 'actual'
                    });
                    await Elemento.update(
                        {
                            disponibles: elementoEncontrado.disponibles - cantidad,
                            estado: elementoEncontrado.disponibles + cantidad <= elementoEncontrado.minimo ? 'agotado' : 'disponible'
                        },
                        { where: { idelemento: elemento } }
                    );
                }
            } else  {
                if (cantidad > disponibles) {
                    return res.status(400).json({ mensaje: 'No se puede aceptar el préstamo porque supera la cantidad disponible del elemento'})
                }
                const prestamo = await PrestamoCorriente.create({
                    clientes_documento: documento,
                    estado: 'actual',
                    areas_idarea: area
                });
                await ElementoHasPrestamoCorriente.create({
                    elementos_idelemento: elemento,
                    prestamoscorrientes_idprestamo: prestamo.idprestamo,
                    cantidad,
                    observaciones,
                    fecha_entrega: obtenerHoraActual(),
                    estado: 'actual'
                });
                await Elemento.update(
                    {
                        disponibles: elementoEncontrado.disponibles - cantidad,
                        estado: elementoEncontrado.disponibles + cantidad <= elementoEncontrado.minimo ? 'agotado' : 'disponible'
                    },
                    { where: { idelemento: elemento } }
                );
            }
        } else {
            return res.status(400).json({mensaje: 'No puedes reclamar un encargo que no ha sido aceptado'})
        }

        await ElementoHasEncargo.destroy({ where: {encargos_idencargo: idencargo, elementos_idelemento: elemento}});
        const encargos = await ElementoHasEncargo.findAll({ where: {encargos_idencargo: idencargo}});
        if (encargos.length<1) {
            await Encargo.destroy({where: {idencargo: idencargo}});
        }
        
        createRecord(area,'encargo', idencargo, adminId, documento, cliente.nombre, elemento, elementoEncontrado.descripcion, elementoEncargo.cantidad, observaciones, 'actual', 'RECLAMAR ENCARGO'); 

        return res.status(200).json({mensaje: 'Encargo aceptado correctamente'})
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al aceptar el encargo, por favor vuleva a intentarlo' });
    }
};

// ACEPTAR EL ENCAGRGO 
const acceptEncargo = async (req, res) => {
    try {
        const { area, id: adminId } = req.user;
        const { idencargo } = req.params;
        const { elemento, observaciones } = req.body; 

        const elementoEncontrado = await Elemento.findOne({where: {idelemento: elemento}})
        const encargoEncargo = await Encargo.findOne({ where: {idencargo: idencargo}})
        const documento = encargoEncargo.clientes_documento;
        const cliente = await Cliente.findOne({where: {documento}})
        const encargo = await ElementoHasEncargo.findOne({ where: {encargos_idencargo: idencargo, elementos_idelemento: elemento}});  
        if (!encargo) {
            return res.status(400).json({ mensaje: 'El encargo que intenta aceptar no existe'});
        }
        // Obtener la fecha actual en formato 'YYYY-MM-DD'
        const currentDate = new Date().toISOString().split('T')[0];

        // Obtener la fecha del encargo (en formato 'YYYY-MM-DD')
        const encargoDate = encargoEncargo.fecha_reclamo.toISOString().split('T')[0];

        // Comparar las fechas (solo la parte de la fecha, sin la hora)
        if (encargoDate < currentDate) {
            return res.status(400).json({ mensaje: 'El encargo no puede ser aceptado, la fecha del encargo ya ha pasado' });
        }
        if (encargo.estado == 'pendiente') {
            await ElementoHasEncargo.update({estado: 'aceptado', observaciones: observaciones}, {where: {encargos_idencargo: idencargo, elementos_idelemento: elemento}});
        }
        createRecord(area,'encargo', idencargo, adminId, documento, cliente.nombre, elemento, elementoEncontrado.descripcion, encargo.cantidad, observaciones, 'aceptado', 'ACEPTAR ENCARGO'); 

        res.status(200).json({mensaje: 'Encargo aceptado correctamente'})
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al aceptar el encargo, por favor vuleva a intentarlo' });
    }
}

// CANCELAR EL ENCAGRGO QUE YA HABÍA ACEPTADO Y DEVOLVERLO A PENDIENTE
const cancelAceptar = async (req, res) => {
    try {
        const { area, id: adminId } = req.user;
        const { idencargo } = req.params;
        const { elemento, observaciones } = req.body; 

        const elementoEncontrado = await Elemento.findOne({where: {idelemento: elemento}})
        const encargoEncargo = await Encargo.findOne({ where: {idencargo: idencargo}})
        const documento = encargoEncargo.clientes_documento;
        const cliente = await Cliente.findOne({where: {documento}})
        const encargo = await ElementoHasEncargo.findOne({ where: {encargos_idencargo: idencargo, elementos_idelemento: elemento}});  
        if (!encargo) {
            return res.status(400).json({ mensaje: 'El encargo que intenta pasar a pendiente no existe'});
        }
        if (encargo.estado == 'aceptado') {
            await ElementoHasEncargo.update({estado: 'pendiente', observaciones: observaciones}, {where: {encargos_idencargo: idencargo, elementos_idelemento: elemento}});
        }
        createRecord(area,'encargo', idencargo, adminId, documento, cliente.nombre, elemento, elementoEncontrado.descripcion, encargo.cantidad, observaciones, 'pendiente', 'CNACELAR ENCARGO ACEPTADO'); 

        res.status(200).json({mensaje: 'Encargo pasado a pendientes correctamente'})
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al pasar a pendiente el encargo, por favor vuleva a intentarlo' });
    }
}

// OBTENER LS ENCARGOS QUE HAY PARA EL DÍA ACTUAL PARA QUE LE AVISE AL ADMIN AL INICIAR SESION
const encargosHoy = async (today, area) => {
    const encargos = await ElementoHasEncargo.findAll({
        include: [
            {
                model: Encargo,
                where: { 
                    areas_idarea: area,
                    [Op.and]: [
                        Sequelize.where(Sequelize.fn('DATE', Sequelize.col('fecha_reclamo')), today) // Compara solo la fecha
                    ]
                }
            }
        ],
        where: {
            estado: {
                [Op.ne]: 'rechazado'  // `Op.ne` significa "no igual"
            }
        }
    });
    return encargos;
}

export { createEncargo, cancelEncargo, getInstructorEncargos, getAdminEncargos, rejectEncargo, acceptEncargo, reclaimEncargo, cancelAceptar, encargosHoy };