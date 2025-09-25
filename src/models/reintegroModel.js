import { DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';

const Reintegro = sequelize.define('Reintegro', {
  idbaja: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  elementos_idelemento: {
    type: DataTypes.INTEGER
  },
  descripcion: {
    type: DataTypes.STRING
  },
  cantidad: {
    type: DataTypes.INTEGER
  },
  archivo: {
    type: DataTypes.STRING
  },
  observaciones: {
    type: DataTypes.STRING
  },
  fecha: {
    type: DataTypes.DATE
  },
  idadmin: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'reintegros',
  timestamps: false
});

export default Reintegro;
