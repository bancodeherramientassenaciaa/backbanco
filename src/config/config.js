import dotenv from 'dotenv';
dotenv.config();

const config = {
    app: {
        port: process.env.PORT
    }, 
    jwt: {
        secret: process.env.JWT_SECRET,
        secretnewcontrasena: process.env.JWT_SECRET_RESTABLECER_CONTRASENA
    },
    mysql: {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,  
        database: process.env.MYSQL_DATABASE, 
        port: process.env.MYSQL_PORT || 3306
    },
    email: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT
    }
};

export default config;