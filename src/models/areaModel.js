import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/connection.js';

class Area extends Model {}

Area.init({
    idarea: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING(45),
        allowNull: false
    } 
}, {
    sequelize,
    modelName: 'Area',
    tableName: 'areas',
    timestamps: false
});

export default Area;