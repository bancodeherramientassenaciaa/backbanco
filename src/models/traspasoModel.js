import { DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';

const Traspaso = sequelize.define('Traspaso', {
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
  clientes_documento: {
    type: DataTypes.STRING
  },
  idadmin: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'traspasos',
  timestamps: false
});

export default Traspaso;
