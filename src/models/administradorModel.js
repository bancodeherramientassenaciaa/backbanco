import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/connection.js';
import Area from './areaModel.js';

class Administrador extends Model {}

Administrador.init({
  documento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  contrasena: {
    type: DataTypes.STRING(80),
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('admin', 'contratista', 'practicante', 'supervisor'),
    allowNull: false
  },
  correo: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  numero: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  areas_idarea: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Area,
      key: 'idarea',
      allowNull: false
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
}
}, {
  sequelize,        
  modelName: 'Administrador',
  tableName: 'administradores',
  timestamps: false
});

export default Administrador;

