import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import sequelize from './db/connection.js';
import config from './config/config.js';

// Importa tus routers
import loginRoute from './routes/auth/loginRouter.js';
import logoutRoute from './routes/auth/logoutRouter.js';
import areaRoutes from './routes/areaRouter.js';
import historialRoute from './routes/historialRouter.js';
import adminRoutes from './routes/administradorRouter.js';
import clientRoutes from './routes/clienteRouter.js';
import roleRoutes from './routes/rolRouter.js';
import elementRoutes from './routes/elementoRouter.js';
import prestamoCorrienteRoutes from './routes/prestamoCorrienteRouter.js';
import prestamoEspecialRoutes from './routes/prestamoEspecialRouter.js';
import consumoRoutes from './routes/consumoRouter.js';
import moraRoutes from './routes/moraRouter.js';
import danoRoutes from './routes/danoRouter.js';
import bajaRoutes from './routes/bajaRouter.js';
import encargoRoutes from './routes/encargoRouter.js';
import olvidarContrasena from './routes/auth/olvidarContrasenaRouter.js';
import importarExcel from './routes/excelRouter.js';

const app = express();

// Configura CORS
const corsOptions = {
  origin: '*', // Permitir todos los orígenes
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Permite preflight
app.use(express.json());

// Monta rutas
app.use('/api/login', loginRoute);
app.use('/api/logout', logoutRoute);
app.use('/api/historial', historialRoute);
app.use('/api/areas', areaRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/elements', elementRoutes);
app.use('/api/prestamos', prestamoCorrienteRoutes);
app.use('/api/prestamosEs', prestamoEspecialRoutes);
app.use('/api/consumos', consumoRoutes);
app.use('/api/moras', moraRoutes);
app.use('/api/danos', danoRoutes);
app.use('/api/bajas', bajaRoutes);
app.use('/api/encargos', encargoRoutes);
app.use('/api/olvidar-contrasena', olvidarContrasena);
app.use('/api/importar-excel', importarExcel);

// Carpeta estática para imágenes
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexión a la BD
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ BD conectada correctamente');
    await sequelize.sync();
    console.log('✅ Modelos sincronizados');
  } catch (err) {
    console.error('❌ Error al conectar BD:', err);
  }
})();

app.set('port', config.app.port);

export default app;
