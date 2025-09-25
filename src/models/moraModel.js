import { DataTypes, Model, Sequelize } from 'sequelize';
import sequelize from '../db/connection.js';
import Elemento from './elementoModel.js';
import Cliente from './clienteModel.js';
import Area from './areaModel.js';

class Mora extends Model{} 

Mora.init({
    idmora: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    }, 
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false 
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') 
    },
    observaciones: {
        type: DataTypes.STRING(200),
        allowNull: true 
    },
    elementos_idelemento: {
        type: DataTypes.INTEGER,
        references: {  
          model: Elemento,
          key: 'idelemento',
          allowNull: false
        }, 
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    clientes_documento: {
        type: DataTypes.INTEGER,
        references: {
          model: Cliente,
          key: 'documento',
          allowNull: false
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
},  {
    sequelize,
    modelName: 'Mora',
    tableName: 'moras',
    timestamps: false
})

export default Mora;