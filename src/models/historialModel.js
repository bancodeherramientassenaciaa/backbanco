import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/connection.js';

class Historial extends Model {}

Historial.init({
    id_historial: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    tipo_entidad: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    entidad_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cliente_nombre: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    elemento_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    elemento_descripcion: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    observaciones: {
        type: DataTypes.STRING(300),
        allowNull: true
    },
    estado: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    accion: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    fecha_accion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW 
    },
    admin_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    area_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Historial',
    tableName: 'Historialpemdb',
    timestamps: false
});

export default Historial;