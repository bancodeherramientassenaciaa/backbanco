import { DataTypes, Model, Sequelize } from 'sequelize';
import sequelize from '../db/connection.js';
import Elemento from './elementoModel.js';
import Encargo from './encargoModel.js';

class ElementoHasEncargo extends Model{}

ElementoHasEncargo.init({
  elementos_idelemento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
        model: Elemento,
        key: 'idelemento'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
  },
  encargos_idencargo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
          model: Encargo,
          key: 'idencargo'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
  },
  cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
  },
  observaciones: {
      type: DataTypes.STRING(200),
      allowNull: true
  },
  fecha_devolucion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'aceptado', 'rechazado'),
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'ElementoHasEncargo',
  tableName: 'elementos_has_encargos',
  timestamps: false
});

export default ElementoHasEncargo;
