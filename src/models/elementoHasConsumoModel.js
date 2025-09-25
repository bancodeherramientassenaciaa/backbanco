import { DataTypes, Model, Sequelize } from 'sequelize';
import sequelize from '../db/connection.js'; 
import Elemento from './elementoModel.js';
import Consumo from './consumoModel.js';

class ElementoHasConsumo extends Model{} 

ElementoHasConsumo.init({
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
  consumos_idconsumo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
          model: Consumo,
          key: 'idconsumo'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
  },
  cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
  },
  fecha: {
      type: DataTypes.DATE,
      allowNull: false  
  },
  observaciones: {
      type: DataTypes.STRING(200),
      allowNull: true
  },
  administradores_documento: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
    sequelize,
    modelName: 'ElementoHasConsumo',
    tableName: 'elementos_has_consumos',
    timestamps: false
});

export default ElementoHasConsumo;
