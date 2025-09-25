import { DataTypes, Model } from "sequelize";
import sequelize from '../db/connection.js';
import Elemento from "./elementoModel.js";
import Area from "./areaModel.js";

class Baja extends Model {}

Baja.init ({
    idbaja: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    elementos_idelemento: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {  
          model: Elemento,
          key: 'idelemento'
        },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL'
    }, 
    tipo: {
        type: DataTypes.ENUM('reintegro', 'traspaso'),
        allowNull: false
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false 
    },
    archivo: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    observaciones: {
        type: DataTypes.STRING(300),
        allowNull: true
    },
    clientes_documento: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    areas_idarea: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {  
          model: Area,
          key: 'idarea'
        },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL'
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false
    },
    idadmin: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('des', 'hab'),
        allowNull: false
    } 
},  {
    sequelize,
    modelName: 'Baja',
    tableName: 'bajas',
    timestamps: false
});

export default Baja;