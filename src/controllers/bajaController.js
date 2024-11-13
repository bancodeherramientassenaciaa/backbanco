import { Baja, Cliente, Elemento, Area } from '../models/index.js';
import { ajustarHora, formatFecha } from './auth/adminsesionController.js';
import { createRecord } from './historialController.js';
import upload from '../middlewares/archivoBajaMiddleware.js';

const obtenerHoraActual = () => ajustarHora(new Date());

// Registrar reintegro
const createReintegro = async (req, res) => {
    try {
        upload.single('archivo')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ mensaje: 'Error desconcoido con el archivo'});
            }
            // Parsear elementos desde JSON
            const elementos = JSON.parse(req.body.elementos);
            const archivo = req.file ? req.file.filename : null;
            const { area, id: adminId } = req.user;

            if (!archivo) {
                return res.status(400).json({mensaje: 'El archivo es obligatorio'});
            }

            for (let elemento of elementos) {
                const { idelemento, cantidad, observaciones } = elemento; 

                if (cantidad <= 0) {
                    return res.status(400).json({ mensaje: `La cantidad no puede ser 0 ni menor que éste`});
                }

                const elementoEncontrado = await Elemento.findOne({ where: { idelemento , areas_idarea: area, tipo: 'devolutivo'}});
                if (!elementoEncontrado) {
                    return res.status(404).json({ mensaje: `Elemento con el ID ${idelemento} no encontrado en el inventario` });
                }

                if (cantidad > elementoEncontrado.cantidad) {
                    return res.status(400).json({ mensaje: `La cantidad de reintegro supera la cantidad total del elemento` });
                }

                const reintegro = await Baja.create({
                    elementos_idelemento: idelemento,
                    tipo: 'reintegro',
                    cantidad,
                    observaciones,
                    areas_idarea: area,
                    fecha: obtenerHoraActual(),
                    idadmin: adminId,
                    archivo,
                    estado: 'des'
                });

                await Elemento.update(
                    {
                        disponibles: elementoEncontrado.disponibles - cantidad,
                        cantidad: elementoEncontrado.cantidad - cantidad,
                        estado: elementoEncontrado.disponibles - cantidad <= elementoEncontrado.minimo ? 'agotado' : 'disponible'
                    },
                    { where: { idelemento } }
                );

                createRecord(area, 'reintegro', reintegro.idbaja, adminId, 0, 'Banco', idelemento, elementoEncontrado.descripcion, cantidad, observaciones, 'reintegro', 'REINTEGRO');
            }
            return res.status(200).json({ mensaje: 'Elementos reintegrados con éxito' });
        });
    } catch (error) {
        console.log(error);console.log('hola')
        return res.status(500).json({ mensaje: 'Error inesperado, intente recargar la página'});
    }
};

// Registrar traspaso
const createTraspaso = async (req, res) => {
    try {
        upload.single('archivo')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.mensaje });
            }
            // Parsear elementos desde JSON
            const elementos = JSON.parse(req.body.elementos);
            const documento = req.body.documento;
            const archivo = req.file ? req.file.filename : null;
            const { area, id: adminId } = req.user;

            if (!documento) {
                return res.status(400).json({mensaje: 'Debes ingresar el documento del cuentadante a transferir el elemento'});
            }

            const cuentadante = await Cliente.findOne({ where: {documento: documento}});
            if (!cuentadante) {
                return res.status(404).json({ mensaje: 'La persona a la que intenta hacer el traspaso no se encuentra registrada'});
            }

            if (!archivo) {
                return res.status(400).json({mensaje: 'El archivo es obligatorio'});
            }

            for (let elemento of elementos) {
                const { idelemento, cantidad, observaciones } = elemento; 

                if (cantidad <= 0) {
                    return res.status(400).json({ mensaje: `La cantidad no puede ser 0 ni menor que éste`});
                }

                const elementoEncontrado = await Elemento.findOne({ where: { idelemento , areas_idarea: area, tipo: 'devolutivo'}});
                if (!elementoEncontrado) {
                    return res.status(404).json({ mensaje: `Elemento con el ID ${idelemento} no encontrado en el inventario` });
                }

                if (cantidad > elementoEncontrado.cantidad) {
                    return res.status(400).json({ mensaje: `La cantidad de traspaso supera la cantidad total del elemento` });
                }

                const traspaso = await Baja.create({
                    elementos_idelemento: idelemento,
                    tipo: 'traspaso',
                    cantidad,
                    observaciones,
                    areas_idarea: area,
                    fecha: obtenerHoraActual(),
                    idadmin: adminId,
                    archivo,
                    clientes_documento: documento, 
                    estado: 'hab'
                });

                await Elemento.update(
                    {
                        disponibles: elementoEncontrado.disponibles - cantidad,
                        cantidad: elementoEncontrado.cantidad - cantidad,
                        estado: elementoEncontrado.disponibles - cantidad <= elementoEncontrado.minimo ? 'agotado' : 'disponible'
                    },
                    { where: { idelemento } }
                );

                createRecord(area, 'traspaso', traspaso.idbaja, adminId, documento, cuentadante.nombre, idelemento, elementoEncontrado.descripcion, cantidad, observaciones, 'traspaso', 'TRASPASO A CUENTADANTE');
            }
            return res.status(200).json({ mensaje: 'Elementos traspasados con éxito' });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensaje: 'Error inesperado, intente recargar la página'});
    }
};

// Obtener todos los registros de las bajas 
const getAllReintegros = async (req, res) => {
    try {
        const { area } = req.user;
        const reintegros = await Baja.findAll({
            include: [
              {
                model: Elemento,
                where: { areas_idarea: area },  
                attributes: [ 'idelemento', 'descripcion', 'cantidad']
              }
            ],
            order: [['fecha', 'DESC']],
            where: { tipo: 'reintegro' }
        });
        const reintegroFormateado = reintegros.map(reintegro => {
            const fechaAccion = formatFecha(reintegro.fecha, 5);
            return {
              ...reintegro.dataValues,
              fecha: fechaAccion
            };
          });
      
          res.json(reintegroFormateado); 
    } catch (error) {
        console.log(error)
        return res.status(500).json({ mensaje: 'Error al obtener los reintegros, por favor vuelva a intentarlo'})
    }
};

// Obtener todos los registros de traspasos
const getAllTraspasos = async (req, res) => {
    try {
        const { area } = req.user;
        const traspasos = await Baja.findAll({
            include: [
              {
                model: Elemento,
                where: { areas_idarea: area },  
                attributes: [ 'idelemento', 'descripcion', 'cantidad']
              }
            ],
            order: [['fecha', 'DESC']],
            where: { tipo: 'traspaso' }
        });
        const traspasoFormateado = traspasos.map(traspaso => {
            const fechaAccion = formatFecha(traspaso.fecha, 5);
            return {
              ...traspaso.dataValues,
              fecha: fechaAccion
            };
          });
      
          res.json(traspasoFormateado); 
    } catch (error) {
        console.log(error)
        return res.status(500).json({ mensaje: 'Error al obtener los traspasos, por favor vuelva a intentarlo'})
    }
};

// Devolver traspaso
const returnTraspaso = async (req, res) => {
    try {
        upload.single('archivo')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.mensaje });
            }
            const archivo = req.file ? req.file.filename : null;   
            const { area, id: adminId } = req.user;
            const { observaciones, traspaso } = req.body;
            const parsedTraspaso = JSON.parse(traspaso); // Parsear el JSON recibido
            const { elementos_idelemento, cantidad } = parsedTraspaso; // Desestructurar desde el objeto parseado

            const elementoEncontrado = await Elemento.findOne({ where: { idelemento: elementos_idelemento, areas_idarea: area, tipo: 'devolutivo'}});
            if (!elementoEncontrado) {
                return res.status(404).json({ mensaje: `No puedes tranferir este elemento, debes volver a registrarlo` });
            }
            if (!archivo) {
                return res.status(400).json({mensaje: 'El archivo es obligatorio'});
            }

            const traspasoBanco = await Baja.create({
                elementos_idelemento: elementos_idelemento,
                tipo: 'traspaso',
                cantidad: cantidad,
                observaciones: observaciones,
                areas_idarea: area,
                fecha: obtenerHoraActual(),
                idadmin: adminId,
                clientes_documento: 0,
                archivo: archivo,
                estado: 'des'
            });

            await Baja.update({ estado: 'des'}, { where: {idbaja: parsedTraspaso.idbaja }});

            await Elemento.update(
                {
                    disponibles: elementoEncontrado.disponibles + cantidad,
                    cantidad: elementoEncontrado.cantidad + cantidad,
                    estado: elementoEncontrado.disponibles + cantidad <= elementoEncontrado.minimo ? 'agotado' : 'disponible'
                },
                { where: { idelemento: elementos_idelemento } }
            );
            
            createRecord(area, 'traspaso', traspasoBanco.idbaja, adminId, 0, 'Banco', elementos_idelemento, elementoEncontrado.descripcion, cantidad, observaciones, 'traspaso', 'TRASPASO A BANCO');
        });
        return res.status(200).json({ mensaje: 'Elemento transferido al banco con éxito'})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ mensaje: 'Error inesperado, intente recargar la página'});
    }
};

export { createReintegro, getAllReintegros, createTraspaso, getAllTraspasos, returnTraspaso};