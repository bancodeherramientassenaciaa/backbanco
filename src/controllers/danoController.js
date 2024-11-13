import { Dano, Cliente, Elemento } from '../models/index.js';
import { ajustarHora, formatFecha } from './auth/adminsesionController.js';
import { createRecord } from './historialController.js';

const obtenerHoraActual = () => ajustarHora(new Date());
 
// CREAR DAÑO
const createDano = async (cantidad, observaciones, idelemento, documento, area) => {
    const dano= await Dano.create({
        cantidad: cantidad,
        fecha: obtenerHoraActual(),
        observaciones: observaciones,
        elementos_idelemento: idelemento,
        clientes_documento: documento,
        areas_idarea: area
    })
    return dano;
}

// REPONER ELEMENTO EN DAÑO
const returnDano = async (req, res) => {
    try {
      const { area, id: adminId } = req.user;
      const { iddano, idelemento, cantidadDevuelta, observaciones, documento } = req.body;

      const cliente = await Cliente.findOne({ where: {documento: documento}});
      const elemento = await Elemento.findOne({where: {idelemento: idelemento}});

      const nombreClienteEnDano = cliente.nombre; // Nombre actual del cliente
      const descripcionElementoEnDano = elemento.descripcion;

      const dano = await Dano.findOne({ where: {iddano: iddano}});

      if (dano.cantidad == cantidadDevuelta) {
        await Elemento.update(
          {
              disponibles: elemento.disponibles + cantidadDevuelta,
              estado: elemento.disponibles + cantidadDevuelta <= elemento.minimo ? 'agotado' : 'disponible'
          },
          { where: { idelemento } }
        );
        await Dano.destroy({
            where: {
                iddano: iddano,
                elementos_idelemento: idelemento
            }
        });
        createRecord(area, 'daño', iddano, adminId, documento, nombreClienteEnDano, idelemento, descripcionElementoEnDano, cantidadDevuelta, observaciones, 'finalizado', 'REPONER TOTAL ELEMENTO EN DAÑO');
      } else if  (dano.cantidad !== cantidadDevuelta) {
          await Elemento.update(
            {
                disponibles: elemento.disponibles + cantidadDevuelta,
                estado: elemento.disponibles + cantidadDevuelta <= elemento.minimo ? 'agotado' : 'disponible'
            },
            { where: { idelemento } }
          );
          await Dano.update(
            { cantidad: dano.cantidad - cantidadDevuelta },
            { where: { iddano: iddano}}
          );
          createRecord(area, 'daño', iddano, adminId, documento, nombreClienteEnDano, idelemento, descripcionElementoEnDano, cantidadDevuelta, observaciones, 'daño', 'REPONER PARTE ELEMENTO EN DAÑO');
      } else if (dano.cantidad<cantidadDevuelta || cantidadDevuelta<1) {
          return res.status(400).json({ mensaje: 'La cantidad de devolución no puede ser mayor a la cantidad a dano ni meno a 1', error})
      } 
  
      return res.status(200).json({ mensaje: 'elementos repuestos'})
    } catch (error) { 
      console.log(error); 
      return res.status(500).json({ mensaje: 'error al regresar daño', error})
    }
}

// OBTENER TODOS LOS DAÑOS ACTUALES
const getAllDanos = async (req, res) => {
    try {
        const { area } = req.user;
        const danos = await Dano.findAll({
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
        const danoFormateado = danos.map(dano => {
            const fechaAccion = formatFecha(dano.fecha, 5);
            return {
              ...dano.dataValues,
              fecha: fechaAccion
            };
          });
      
          res.json(danoFormateado); 
    } catch (error) {
        console.log(error)
        return res.status(500).json({ mensaje: 'Error al obtener los datos'})
    }
}

export { createDano, getAllDanos, returnDano };

// nombre User, cedula, codigo GroupIcon, codigo Elementos, descripcion, cantidad, observaciones, fecha, tiempo en dano