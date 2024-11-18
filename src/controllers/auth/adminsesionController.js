import { Op } from 'sequelize';
import { format, parseISO, isValid, addHours } from 'date-fns';
import { es } from 'date-fns/locale'; 
import { AdminSesion } from '../../models/index.js';

const formatFecha = (fecha, ajusteHoras = 0) => {
    if (!fecha) return null;

    try {
        const isoFecha = new Date(fecha).toISOString();

        const parsedDate = parseISO(isoFecha);

        if (!isValid(parsedDate)) {
            throw new Error('Fecha inválida');
        }

        const adjustedDate = addHours(parsedDate, ajusteHoras);

        return format(adjustedDate, 'MM/dd/yyyy h:mm:ss a');
    } catch (error) {
        console.error('Error al formatear la fecha:', error);
        return null;
    }
};

const ajustarHora = (date) => {
  const offset = -5; // Esto es para cuadrar las horas manualmente porque en la bd se están guardando las hroas con un desface de 5 horas
  const adjustedDate = new Date(date.getTime() + offset * 60 * 60 * 1000);
  return format(adjustedDate, 'yyyy-MM-dd HH:mm:ss', { locale: es });
};

const obtenerHoraActual = () => ajustarHora(new Date());

const nuevaSesion = (documento) => AdminSesion.create({
    administradores_documento: documento,
    login: obtenerHoraActual()
});

const terminarSesion = async (documento) => {
    try {
        const sesion = await AdminSesion.findOne({
            where: {
                administradores_documento: documento,
                logout: null
            },
            order: [['login', 'DESC']]
        });

        if (sesion) {
            sesion.logout = obtenerHoraActual();
            await sesion.save();
        } else {
            console.log('No se encontró una sesión activa para este administrador.');
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
};

export { nuevaSesion, terminarSesion, ajustarHora, formatFecha, obtenerHoraActual };
