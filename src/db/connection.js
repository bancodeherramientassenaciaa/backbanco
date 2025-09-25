import { Sequelize } from 'sequelize';
import config from '../config/config.js';

const dbUrl = `mysql://${config.mysql.user}:${config.mysql.password}@${config.mysql.host}:${config.mysql.port}/${config.mysql.database}`;

const sequelize = new Sequelize(dbUrl, {
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 30, // máximo de conexiones simultáneas
    min: 0,
    acquire: 60000, // 60 segundos para adquirir una conexión
    idle: 10000 // 10 segundos de inactividad antes de liberar
  }
});

export default sequelize;

