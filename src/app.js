import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import sequelize from './db/connection.js';
import config from './config/config.js';

import loginRoute from './routes/auth/loginRouter.js';
// import logoutRoute from './routes/auth/logoutRouter.js'; // Descomenta cuando esté listo
import areaRouter from './routes/areaRouter.js';

const app = express();

// 1) Defino orígenes permitidos
const allowedOrigins = [
  'https://frontbanco.vercel.app',
  'https://frontbanco-mnwovbyl5-banco-de-herramientas-projects.vercel.app'
];

// 2) Opciones de CORS
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS: ' + origin));
  },
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization']
};

// 3) Monteo CORS *antes* de las rutas
app.use(cors(corsOptions));
app.use(express.json());

// 4) Rutas
app.use('/api/login', loginRoute);
// app.use('/api/logout', logoutRoute); // Comentado hasta que esté listo
app.use('/api/areas', areaRouter);

// 5) Carpeta estática de uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 6) Comprobación BD y sync de modelos
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida correctamente con la base de datos');
    await sequelize.sync();
    console.log('Modelos sincronizados con la base de datos');
  } catch (err) {
    console.error('Error con la base de datos:', err);
  }
})();

// 7) Puerto
app.set('port', config.app.port);

export default app;