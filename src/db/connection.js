import { Sequelize } from 'sequelize';
import config from '../config/config.js';

const dbUrl = `mysql://${config.mysql.user}:${config.mysql.password}@${config.mysql.host}:${config.mysql.port}/${config.mysql.database}`;

const sequelize = new Sequelize(dbUrl, {
  dialect: 'mysql', 
  logging: false, 
});

export default sequelize;

