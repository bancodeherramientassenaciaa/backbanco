import bcrypt from 'bcryptjs';
import { Administrador } from './src/models/index.js';
import sequelize from './src/db/connection.js';

async function cambiarContrasena(documento, nuevaContrasena) {
  try {
    await sequelize.authenticate();
    const admin = await Administrador.findOne({ where: { documento } });
    if (!admin) {
      console.log('Administrador no encontrado');
      return;
    }
    const hash = await bcrypt.hash(nuevaContrasena, 10);
    admin.contrasena = hash;
    await admin.save();
    console.log('Contraseña actualizada correctamente');
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error);
  } finally {
    await sequelize.close();
  }
}

// Cambia los valores aquí si necesitas otro usuario o contraseña
cambiarContrasena('1036251143', 'admin');
