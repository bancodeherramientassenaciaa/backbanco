import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/connection.js';
import Cliente from './clienteModel.js';
import Area from './areaModel.js';

class PrestamoEspecial extends Model {}

PrestamoEspecial.init({
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
    fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: false
    },
    fecha_fin: {
        type: DataTypes.DATE,
        allowNull: false
    },
    archivo: {
        type: DataTypes.STRING(100),
        allowNull: true
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
    },
    estado: {
        type: DataTypes.ENUM('actual', 'finalizado'),
        allowNull: false
    }
},  {
    sequelize,
    modelName: 'PrestamoEspecial',
    tableName: 'prestamosespeciales',
    timestamps: false 
});

export default PrestamoEspecial;