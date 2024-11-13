import { DataTypes, Model, Sequelize } from 'sequelize';
import sequelize from '../db/connection.js'; 
import Elemento from './elementoModel.js';
import PrestamoEspecial from './prestamoespecialModel.js';

class ElementoHasPrestamoEspecial extends Model{}

ElementoHasPrestamoEspecial.init({
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
  prestamosespeciales_idprestamo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
          model: PrestamoEspecial,
          key: 'idprestamo'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
  },
  cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
  },
  fecha_entrega: {
      type: DataTypes.DATE,
      allowNull: false
  },
  fecha_devolucion: {
      type: DataTypes.DATE,
      allowNull: true
  },
  observaciones: {
      type: DataTypes.STRING(200),
      allowNull: true
  },
  estado: {
      type: DataTypes.ENUM('actual', 'finalizado'),
      allowNull: false
  }
}, {
  sequelize,
  modelName: 'ElementoHasPrestamoEspecial',
  tableName: 'elementos_has_prestamosespeciales',
  timestamps: false
});

export default ElementoHasPrestamoEspecial;
