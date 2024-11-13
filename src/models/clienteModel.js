import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/connection.js';
import Rol from './rolModel.js';

class Cliente extends Model {}

Cliente.init ({
    documento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false 
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false 
    },
    correo: {
        type: DataTypes.STRING(45),
        allowNull: false 
    },
    contrasena: {
        type: DataTypes.STRING(80),
        allowNull: true
    },
    fechaInicio: {
        type: DataTypes.DATE,
        allowNull: false 
    },
    fechaFin: {
        type: DataTypes.DATE,
        allowNull: false 
    },
    observaciones: {
        type: DataTypes.STRING(300),
        allowNull: true 
    },
    numero: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    foto: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
    roles_idrol: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Rol,
          key: 'idrol',
          allowNull: false
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
},  {
    sequelize,
    modelName: 'Cliente',
    tableName: 'clientes',
    timestamps: false
});

export default Cliente;