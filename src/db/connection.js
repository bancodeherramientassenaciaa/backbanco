import { Sequelize } from 'sequelize';
import config from '../config/config.js';

const dbUrl = `mysql://${config.mysql.user}:${config.mysql.password}@${config.mysql.host}:${config.mysql.port}/${config.mysql.database}`;

const sequelize = new Sequelize(dbUrl, {
  dialect: 'mysql', 
  logging: false, 
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;

