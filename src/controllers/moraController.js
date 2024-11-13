import { Mora, Cliente, Elemento } from '../models/index.js';
import { ajustarHora, formatFecha } from './auth/adminsesionController.js';
import { createRecord } from './historialController.js';

const obtenerHoraActual = () => ajustarHora(new Date());

// CREAR UNA MORA DESDE PRÉSTAMO
const createMora = async (cantidad, observaciones, idelemento, documento, area) => {
    const mora= await Mora.create({
        cantidad: cantidad,
        fecha: obtenerHoraActual(),
        observaciones: observaciones,
        elementos_idelemento: idelemento,
        clientes_documento: documento,
        areas_idarea: area
    })
    return mora;
}

// REGRESAR ELEMENTOS EN MORA
const returnMora = async (req, res) => {
  try {
    const { area, id: adminId } = req.user;
    const { idmora, idelemento, cantidadDevuelta, observaciones, documento } = req.body;
    const mora = await Mora.findOne({ where: {idmora: idmora}});
    const elemento = await Elemento.findOne({where: {idelemento: idelemento}});
    const cliente = await Cliente.findOne({where: {documento}})
    if (mora.cantidad == cantidadDevuelta) {
      await Elemento.update(
        {
            disponibles: elemento.disponibles + cantidadDevuelta,
            estado: elemento.disponibles + cantidadDevuelta <= elemento.minimo ? 'agotado' : 'disponible'
        },
        { where: { idelemento } }
      );
      await Mora.destroy({
          where: {
              idmora: idmora,
              elementos_idelemento: idelemento
          }
      });
      createRecord(area, 'mora', idmora, adminId, documento, cliente.nombre, idelemento, elemento.descripcion, cantidadDevuelta, observaciones, 'finalizado', 'DEVOLVER TOTAL ELEMENTO EN MORA');
    } else if  (mora.cantidad !== cantidadDevuelta) {
        await Elemento.update(
          {
              disponibles: elemento.disponibles + cantidadDevuelta,
              estado: elemento.disponibles + cantidadDevuelta <= elemento.minimo ? 'agotado' : 'disponible'
          },
          { where: { idelemento } }
        );
        await Mora.update(
          { cantidad: mora.cantidad - cantidadDevuelta },
          { where: { idmora: idmora}}
        );
        createRecord(area, 'mora', idmora, adminId, documento, cliente.nombre, idelemento, elemento.descripcion, cantidadDevuelta, observaciones, 'mora', 'DEVOLVER PARTE ELEMENTO EN MORA');
    } else if (mora.cantidad<cantidadDevuelta || cantidadDevuelta<1) {
        return res.status(400).json({ mensaje: 'La cantidad de devolución no puede ser mayor a la cantidad a mora ni meno a 1', error})
    } 

    return res.status(200).json({ mensaje: 'elementos regresados'})
  } catch (error) { 
    console.log(error); 
    return res.status(500).json({ mensaje: 'error al regresar mora', error})
  }
}

// REGISTROS DE TODAS LAS MORAS ACTIVAS
const getAllMoras = async (req, res) => {
    try {
        const { area } = req.user;
        const moras = await Mora.findAll({
            include: [
              {
                model: Elemento,
                where: { areas_idarea: area },  
                attributes: ['idelemento', 'descripcion']
              },
              {
                model: Cliente,
                attributes: ['documento', 'nombre', 'roles_idrol']
              }
            ]
          });
        const moraFormateada = moras.map(mora => {
            const fechaAccion = formatFecha(mora.fecha, 5);
            return {
              ...mora.dataValues,
              fecha: fechaAccion
            };
          });
      
          res.json(moraFormateada); 
    } catch (error) {
        console.log(error)
        return res.status(500).json({ mensaje: 'error al obtener las moras', error})
    }
}

export { createMora, getAllMoras, returnMora };

// nombre User, cedula, codigo GroupIcon, codigo Elementos, descripcion, cantidad, observaciones, fecha, tiempo en mora