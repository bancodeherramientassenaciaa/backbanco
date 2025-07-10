import bcrypt from 'bcryptjs';
import { Administrador, Cliente, Rol } from '../../models/index.js';
import generarToken from '../../helpers/tokenHelper.js';
import {nuevaSesion} from './adminsesionController.js';
import { encargosHoy } from '../encargoController.js';
import { prestamosesManana } from '../prestamoEspecialController.js';

//Login 
const login = async (req, res) => {
    const { documento, contrasena } = req.body; 
    console.log(new Date())

    // Validación de campos requeridos
    if (!documento || !contrasena) {
      return res.status(400).json({ mensaje: 'Faltan datos: documento y/o contraseña no enviados.' });
    }
  
    try {

      const admin = await Administrador.findOne({ where: { documento } });
      if (admin) {
        console.log('Hash de contraseña almacenado:', admin.contrasena);
      }
      const client = await Cliente.findOne({ where: { documento } });
      if (client) {
        console.log('Hash de contraseña almacenado (cliente):', client.contrasena);
      }

      if(admin) {

        const isAdminMatch = await bcrypt.compare(contrasena, admin.contrasena);

        if (!isAdminMatch) {

          return res.status(400).json({ mensaje: 'Contraseña incorrecta' });

        } else {

          const id = admin.documento;
          const type = 'administrador';
          const role = admin.tipo;
          const area = admin.areas_idarea;

          nuevaSesion(documento);

          const token = generarToken(id, type, role, area);
          const today = new Date().toISOString().split('T')[0]; 
          const encargosDia = await encargosHoy(today,area); 

          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1); // Aumenta un día a la fecha actual
          const tomorrowDate = tomorrow.toISOString().split('T')[0]; // Convierte a formato YYYY-MM-DD
          const prestamosManana = await prestamosesManana(tomorrowDate, area);

          if (encargosDia.length > 0 && prestamosManana.length> 0) {
              // Si hay encargos, puedes incluir esta información en la respuesta
              res.send({
                  documento: id,
                  tipo: type,
                  token,
                  tieneEncargos: true, // Indica que hay encargos
                  tienePrestamos: true,
                  encargos: encargosDia, // Opcional: puedes enviar los detalles de los encargos
                  prestamosEs: prestamosManana
              });
          } else if (encargosDia.length > 0) {
            res.send({
                documento: id,
                tipo: type,
                token,
                tieneEncargos: true, // Indica que hay encargos
                tienePrestamos: false,
                encargos: encargosDia, // Indica que no hay encargos
            });
          } else if (prestamosManana.length > 0) {
            res.send({
                documento: id,
                tipo: type,
                token,
                tieneEncargos: false, // Indica que hay encargos
                tienePrestamos: true,
                prestamosEs: prestamosManana, // Indica que no hay encargos
            });
          } else {
            res.send({
                documento: id,
                tipo: type,
                token,
                tieneEncargos: false, // Indica que hay encargos
                tienePrestamos: false
          });
          }
        }
      } else if (client) {

        const isClientMatch = await bcrypt.compare(contrasena, client.contrasena);

        if (!isClientMatch) {

          return res.status(400).json({ mensaje: 'Contraseña incorrecta' });

        } else { 

          const roles_idrol = client.roles_idrol; 

          const obtenerDescripcion = await Rol.findOne({
            where: { idrol: roles_idrol },
            attributes: ['descripcion']
          });

          const id = client.documento;
          const type = 'cliente';
          const role = obtenerDescripcion ? obtenerDescripcion.descripcion : 'iuytgbngd';

          const token = generarToken(id, type, role);

          res.send({
            documento: id,
            tipo: type,
            token
          });

        }

      } else {

        return res.status(404).json({ mensaje: 'Usuario no encontrado' });

      }
      
    } catch (error) {
      console.log(error)
      res.status(500).json({ mensaje: 'Error en el login, por favor vuelva a intentarlo'});

    }
  };

  export default login;