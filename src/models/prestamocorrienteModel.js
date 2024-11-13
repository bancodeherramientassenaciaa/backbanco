import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/connection.js';
import Cliente from './clienteModel.js';
import Area from './areaModel.js';

class PrestamoCorriente extends Model {}

PrestamoCorriente.init({
    idprestamo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    clientes_documento: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Cliente,
          key: 'documento',
          allowNull: false
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    estado: {
        type: DataTypes.ENUM('actual', 'finalizado'),
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
},  {
    sequelize,
    modelName: 'PrestamoCorriente',
    tableName: 'prestamoscorrientes',
    timestamps: false 
});

export default PrestamoCorriente;