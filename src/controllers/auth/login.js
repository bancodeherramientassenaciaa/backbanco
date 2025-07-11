import bcrypt from 'bcryptjs';
import { Administrador, Cliente, Rol } from '../../models/index.js';
import generarToken from '../../helpers/tokenHelper.js';
import { nuevaSesion } from './adminsesionController.js';
import { encargosHoy } from '../encargoController.js';
import { prestamosesManana } from '../prestamoEspecialController.js';

// Login
const login = async (req, res) => {
  const { documento, contrasena } = req.body;
  console.log('🕒 Login intento:', new Date());

  // Validación de campos requeridos
  if (!documento || !contrasena) {
    return res.status(400).json({ mensaje: 'Faltan datos: documento y/o contraseña no enviados.' });
  }

  try {
    const admin = await Administrador.findOne({ where: { documento } });
    const client = await Cliente.findOne({ where: { documento } });

    // 🔐 Si es administrador
    if (admin) {
      const isAdminMatch = await bcrypt.compare(contrasena, admin.contrasena);

      if (!isAdminMatch) {
        return res.status(400).json({ mensaje: 'Contraseña incorrecta' });
      }

      const id = admin.documento;
      const type = 'administrador';
      const role = admin.tipo;
      const area = admin.areas_idarea;

      nuevaSesion(documento);
      const token = generarToken(id, type, role, area);

      let encargosDia = [];
      let prestamosManana = [];

      // 🧾 Encargos del día
      try {
        const today = new Date().toISOString().split('T')[0];
        encargosDia = await encargosHoy(today, area);
      } catch (error) {
        console.error('❌ Error al obtener encargos del día:', error);
      }

      // 📆 Préstamos de mañana
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDate = tomorrow.toISOString().split('T')[0];
        prestamosManana = await prestamosesManana(tomorrowDate, area);
      } catch (error) {
        console.error('❌ Error al obtener préstamos especiales:', error);
      }

      return res.status(200).json({
        documento: id,
        tipo: type,
        token,
        tieneEncargos: encargosDia.length > 0,
        tienePrestamos: prestamosManana.length > 0,
        encargos: encargosDia,
        prestamosEs: prestamosManana
      });
    }

    // 👤 Si es cliente
    else if (client) {
      const isClientMatch = await bcrypt.compare(contrasena, client.contrasena);

      if (!isClientMatch) {
        return res.status(400).json({ mensaje: 'Contraseña incorrecta' });
      }

      const id = client.documento;
      const type = 'cliente';
      const roles_idrol = client.roles_idrol;

      let role = 'cliente';
      try {
        const rol = await Rol.findOne({
          where: { idrol: roles_idrol },
          attributes: ['descripcion']
        });
        role = rol ? rol.descripcion : 'cliente';
      } catch (error) {
        console.error('❌ Error al obtener el rol:', error);
      }

      const token = generarToken(id, type, role);

      return res.status(200).json({
        documento: id,
        tipo: type,
        token
      });
    }

    // 🧍 Usuario no encontrado
    else {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

  } catch (error) {
    console.error('❌ Error en el proceso de login:', error);
    return res.status(500).json({ mensaje: 'Error en el login, por favor vuelva a intentarlo' });
  }
};

export default login;