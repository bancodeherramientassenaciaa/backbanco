import { DataTypes, Model, Sequelize } from 'sequelize';
import sequelize from '../db/connection.js'; 
import Elemento from './elementoModel.js';
import PrestamoCorriente from './prestamocorrienteModel.js';

class ElementoHasPrestamoCorriente extends Model{}

ElementoHasPrestamoCorriente.init({
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
  prestamoscorrientes_idprestamo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
          model: PrestamoCorriente,
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
  modelName: 'ElementoHasPrestamoCorriente',
  tableName: 'elementos_has_prestamoscorrientes',
  timestamps: false
});

export default ElementoHasPrestamoCorriente;
