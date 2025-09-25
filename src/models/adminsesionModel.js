import { DataTypes, Model, Sequelize } from 'sequelize';
import sequelize from '../db/connection.js'; 
import Administrador from './administradorModel.js';

class AdminSesion extends Model {}

AdminSesion.init({
  idsesion: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  login: {
    type: DataTypes.DATE
  },
  logout: {
    type: DataTypes.DATE,
    allowNull: true
  },
  administradores_documento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: Administrador,
        key: 'documento'
    },  
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}, {
  sequelize,    
  modelName: 'AdminSesion',
  tableName: 'adminsesion',
  timestamps: false
});

export default AdminSesion;