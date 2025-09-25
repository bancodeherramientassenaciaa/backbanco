import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/connection.js';

class Rol extends Model {}

Rol.init({
  idrol: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING(45),
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Role',
  tableName: 'roles',
  timestamps: false
});

export default Rol;
