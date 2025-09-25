import ExcelJS from 'exceljs';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import fs from 'fs'; 
import sequelize from '../db/connection.js';
import { Cliente, Rol, Elemento } from '../models/index.js';

const uploadExcelClienteData = async (req, res) => {
    const t = await sequelize.transaction();
    const filePath = req.file.path; 
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.worksheets[0];
        const jsonData = [];

        // Convierte cada fila a un objeto
        worksheet.eachRow((row) => {
            jsonData.push({
                documento: row.getCell(1).value,
                nombre: row.getCell(2).value,
                correo: row.getCell(3).value,
                numero: row.getCell(4).value,
                contrasena: row.getCell(5).value,
                fechaInicio: row.getCell(6).value,
                fechaFin: row.getCell(7).value,
                roles_idrol: row.getCell(8).value,
                observaciones: row.getCell(9).value,
            });
        });

        const errors = [];
        const seenDocuments = new Set(); // Para rastrear documentos ya procesados

        // Limpiar espacios en blanco de todos los documentos antes de procesar
        jsonData.forEach(item => {
            if (item.documento) {
                item.documento = item.documento.toString().trim();
            }
        });

        // Validación preliminar: busca documentos inválidos
        const invalidItems = jsonData.filter(item => !item.documento || isNaN(item.documento));

        if (invalidItems.length > 0) {
            fs.unlink(filePath, (err) => { // Elimina el archivo si hay errores
                if (err) console.error('Error al eliminar el archivo:', err);
            });
            return res.status(400).json({ mensaje: 'Hay algún (o algunos) cliente sin documento, el documento es requerido y debe ser un número', invalidItems });
        }
        const existingClientes = await Cliente.findAll({ where: { documento: jsonData.map(item => item.documento) } });
        const existingRoles = await Rol.findAll();

        const roleMap = existingRoles.reduce((map, rol) => {
            map[rol.idrol] = rol;
            return map;
        }, {});

        const clienteMap = existingClientes.reduce((map, cliente) => {
            map[cliente.documento] = cliente;
            return map;
        }, {});

        for (const item of jsonData) {
            const errorMessages = [];
            
            // Asegurar que el documento esté limpio (por si acaso)
            if (item.documento) {
                item.documento = item.documento.toString().trim();
            }
            
            const existeRol = roleMap[item.roles_idrol];
            const existeCliente = clienteMap[item.documento];
            // Validaciones

            // Verificar si el documento ya ha sido procesado
            if (seenDocuments.has(item.documento)) {
                errorMessages.push(`El documento ${item.documento} se encuentra más de una vez`);
            } else {
                seenDocuments.add(item.documento); // Agregar al conjunto si no se ha procesado
            }

            // Validar que el cliente no se encuentre ya registrado
            if (existeCliente) {
                errorMessages.push(`El usuario con documento ${item.documento} ya se encuentra registrado`);
            }

            if (!item.nombre || !item.correo || !item.numero || !item.fechaInicio || !item.fechaFin || !item.roles_idrol) {
                errorMessages.push(`Falta información para el cliente ${item.documento}, revisa que ninguna casilla esté vacía`);
            }

            if (!item.nombre) {
                errorMessages.push(`El nombre del cliente ${item.documento} no puede estar vacío`);
            }

            // Manejar el correo: si es un objeto, extraer el texto
            if (item.correo && typeof item.correo === 'object') {
                item.correo = item.correo.text || ''; // Asignar el texto si es un objeto
            }

            // Asegurarse de que item.correo sea una cadena
            if (typeof item.correo !== 'string') {
                item.correo = String(item.correo); // Convertir a cadena si es necesario
            }

            // Validar el formato del correo
            if (!item.correo || !validator.isEmail(item.correo)) {
                errorMessages.push(`El correo no puede ser ${item.correo}, es requerido y debe tener un formato válido para el cliente ${item.documento}`);
            }

            // Validar que el grupo exista
            if (!existeRol) {
                errorMessages.push(`El grupo con el que intenta registrar el usuario ${item.documento} no existe`);
            }

            // Validar número
            if (!item.numero || isNaN(item.numero)) {
                errorMessages.push(`El número no puede ser ${item.numero}, debe haber un número válido para el cliente ${item.documento}`);
            }

            // Validar fechas
            if (!item.fechaInicio || isNaN(item.fechaInicio) || !validator.isISO8601(item.fechaInicio.toISOString())) {
                errorMessages.push(`La fecha de inicio no puede ser ${item.fechaInicio}, es requerida y debe ser una fecha válida para el cliente ${item.documento}`);
            }
            if (!item.fechaFin || isNaN(item.fechaFin) || !validator.isISO8601(item.fechaFin.toISOString())) {
                errorMessages.push(`La fecha de fin no puede ser ${item.fechaFin}, es requerida y debe ser una fecha válida para el cliente ${item.documento}`);
            }

            // Validar contraseña si el rol es instructor
            if (existeRol && existeRol.descripcion === 'instructor' && !item.contrasena) {
                errorMessages.push(`Si es instructor, debe registrar una contraseña para el cliente ${item.documento}`);
            }
            if (existeRol && existeRol.descripcion !== 'instructor' && item.contrasena) {
                errorMessages.push(`Si no es instructor, no debe registrar contraseña para el cliente ${item.documento}`);
            }

            // Si hay errores, agregar a errors y continuar con el siguiente registro
            if (errorMessages.length > 0) {
                errors.push({ item, errors: errorMessages });
                continue; // Salta a la siguiente iteración
            }

            // Si no hay errores, se encripta la contraseña y se inserta
            if (existeRol && existeRol.descripcion === 'instructor' && item.contrasena) {
                const passwordToHash = item.contrasena.toString();
                item.contrasena = await bcrypt.hash(passwordToHash, 10);
            }


                await Cliente.create({
                    documento: item.documento,
                    nombre: item.nombre,
                    correo: item.correo,
                    contrasena: item.contrasena,
                    fechaInicio: item.fechaInicio,
                    fechaFin: item.fechaFin,
                    observaciones: item.observaciones,
                    numero: item.numero,
                    roles_idrol: item.roles_idrol,
                }, { transaction: t });

            };

        if (errors.length > 0) {
            await t.rollback();
            fs.unlink(filePath, (err) => { // Elimina el archivo si hay errores
                if (err) console.error('Error al eliminar el archivo:', err);
            });
            return res.status(400).json({ mensaje: 'Errores en los datos', errors });
        }

        await t.commit();
        res.status(200).json({ mensaje: 'Clientes registrados sin problemas' });

    } catch (error) {
        console.error('Error detallado en uploadExcelClienteData:', error);
        await t.rollback();
        fs.unlink(filePath, (err) => { // Elimina el archivo en caso de error
            if (err) console.error('Error al eliminar el archivo:', err);
        });
        return res.status(500).json({ 
            mensaje: 'Error al procesar el archivo, asegúrate que sea excel (.xlsx) y no esté corrupto.',
            error: error.message 
        });
    }
};

const uploadExcelElementoData = async (req, res) => {
    const t = await sequelize.transaction();
    const filePath = req.file.path;
    try {
        const { area } = req.user;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.worksheets[0];
        const jsonData = [];

        // Convierte cada fila a un objeto, omitiendo filas vacías
        worksheet.eachRow((row, rowNumber) => {
            // Saltar filas vacías o que no tengan descripción
            const descripcion = row.getCell(1).value;
            if (!descripcion || descripcion.toString().trim() === '') {
                return; // Saltar esta fila
            }
            
            jsonData.push({
                descripcion: descripcion.toString().trim(),
                disponibles: row.getCell(2).value,
                cantidad: row.getCell(3).value,
                ubicacion: row.getCell(4).value?.toString().trim() || '',
                tipo: row.getCell(5).value?.toString().trim() || '',
                estado: row.getCell(6).value?.toString().trim() || '',
                minimo: row.getCell(7).value,
                observaciones: row.getCell(8).value?.toString().trim() || null,
            });
        });

        // Validar que todos los elementos tengan descripción
        const missingDescriptions = jsonData.filter(item => !item.descripcion || typeof item.descripcion !== 'string');
        if (missingDescriptions.length > 0) {
            fs.unlink(filePath, (err) => { // Elimina el archivo si hay errores
                if (err) console.error('Error al eliminar el archivo:', err);
            });
            return res.status(400).json({ 
                mensaje: 'Algunos elementos no tienen descripción', 
                invalidItems: missingDescriptions 
            });
        }

        const errors = [];
        const idelementoSet = new Set(); // Para validar duplicados

        for (const item of jsonData) {
            const errorMessages = [];
            // Validaciones y conversión de tipos
            
            // Convertir cantidad a número
            if (item.cantidad === undefined || item.cantidad === null || item.cantidad === '') {
                errorMessages.push(`La cantidad del elemento ${item.descripcion} es requerida`);
            } else {
                const cantidad = parseFloat(item.cantidad);
                if (isNaN(cantidad) || cantidad < 0) {
                    errorMessages.push(`La cantidad del elemento ${item.descripcion} debe ser un número válido mayor o igual a 0`);
                } else {
                    item.cantidad = Math.floor(cantidad); // Convertir a entero
                }
            }

            // Convertir disponibles a número
            if (item.disponibles === undefined || item.disponibles === null || item.disponibles === '') {
                errorMessages.push(`Los disponibles del elemento ${item.descripcion} son requeridos`);
            } else {
                const disponibles = parseFloat(item.disponibles);
                if (isNaN(disponibles) || disponibles < 0) {
                    errorMessages.push(`Los disponibles del elemento ${item.descripcion} deben ser un número válido mayor o igual a 0`);
                } else {
                    item.disponibles = Math.floor(disponibles); // Convertir a entero
                }
            }

            // Validar que disponibles no sea mayor que cantidad (solo si ambos son válidos)
            if (typeof item.cantidad === 'number' && typeof item.disponibles === 'number' && 
                item.disponibles > item.cantidad) {
                errorMessages.push(`Los disponibles del elemento ${item.descripcion} no pueden ser mayores a la cantidad.`);
            }

            // Convertir mínimo a número
            if (item.minimo === undefined || item.minimo === null || item.minimo === '') {
                errorMessages.push(`El mínimo del elemento ${item.descripcion} es requerido`);
            } else {
                const minimo = parseFloat(item.minimo);
                if (isNaN(minimo) || minimo < 0) {
                    errorMessages.push(`El mínimo del elemento ${item.descripcion} debe ser un número válido mayor o igual a 0`);
                } else {
                    item.minimo = Math.floor(minimo); // Convertir a entero
                }
            }

            // Validar que mínimo no sea mayor que cantidad (solo si ambos son válidos)
            if (typeof item.cantidad === 'number' && typeof item.minimo === 'number' && 
                item.minimo > item.cantidad) {
                errorMessages.push(`El mínimo del elemento ${item.descripcion} no puede ser mayor a la cantidad.`);
            }

            if (!item.tipo || (item.tipo !== 'devolutivo' && item.tipo !== 'consumible')) {
                errorMessages.push(`El tipo del elemento ${item.descripcion} no puede estar vacío y solo puede ser "devolutivo" o "consumible".`);
            }

            if (!item.ubicacion) {
                errorMessages.push(`La ubicación del elemento ${item.descripcion} es requerida`);
            }

            if (!item.estado || (item.estado !== 'disponible' && item.estado !== 'agotado')) {
                errorMessages.push(`El estado del elemento ${item.descripcion} no puede estar vacío y solo puede ser "disponible" o "agotado".`);
            }

            // Verificar duplicados en la base de datos
            const existingElemento = await Elemento.findOne({
                where: { descripcion: item.descripcion },
                transaction: t
            });

            if (existingElemento) {
                errorMessages.push(`El elemento con descripción ${item.descripcion} ya está registrado.`);
            }

            // Si hay errores, agregar a errors y continuar con el siguiente registro
            if (errorMessages.length > 0) {
                errors.push({ item, errors: errorMessages });
                continue; // Salta a la siguiente iteración
            }

            const elementoMax = await Elemento.findOne({
                order: [['idelemento', 'DESC']],
                attributes: ['idelemento'],
                transaction: t // Asegúrate de incluir la transacción aquí
            });
            const idelemento = elementoMax ? elementoMax.idelemento + 1 : 1; // Siempre empieza desde 1 si no hay elementos
            try {
                await Elemento.create({
                    idelemento: idelemento,
                    descripcion: item.descripcion,
                    cantidad: item.cantidad,
                    disponibles: item.disponibles,
                    ubicacion: item.ubicacion,
                    tipo: item.tipo,
                    estado: item.estado,
                    observaciones: item.observaciones,
                    minimo: item.minimo,
                    areas_idarea: area,
                }, { transaction: t });
            } catch (createError) {
                errors.push({ item, error: createError.message });
                continue; // Continúa con el siguiente elemento
            }
            };

        if (errors.length > 0) {
            await t.rollback();
            fs.unlink(filePath, (err) => { // Elimina el archivo si hay errores
                if (err) console.error('Error al eliminar el archivo:', err);
            });
            return res.status(400).json({ mensaje: 'Errores en los datos', errors });
        }

        await t.commit();
        res.status(200).json({ mensaje: 'Elementos registrados sin problemas' });

    } catch (error) {
        console.error('Error detallado en uploadExcelElementoData:', error);
        console.error('Stack trace:', error.stack);
        await t.rollback();
        fs.unlink(filePath, (err) => { // Elimina el archivo en caso de error
            if (err) console.error('Error al eliminar el archivo:', err);
        });
        
        // Proporcionar errores más específicos
        let errorMessage = 'Error al procesar el archivo de elementos';
        if (error.name === 'SequelizeValidationError') {
            errorMessage = 'Error de validación en la base de datos: ' + error.message;
        } else if (error.message.includes('Excel')) {
            errorMessage = 'Error al leer el archivo Excel: ' + error.message;
        } else if (error.message.includes('transaction')) {
            errorMessage = 'Error de transacción en la base de datos: ' + error.message;
        } else {
            errorMessage = `Error interno: ${error.message}`;
        }
        
        return res.status(500).json({ 
            mensaje: errorMessage,
            detalle: 'Asegúrate que el archivo sea Excel (.xlsx), no esté corrupto, y tenga el formato correcto. Revisa tu conexión a internet.',
            error: error.message,
            errorType: error.name
        });
    }
};

export {uploadExcelClienteData, uploadExcelElementoData};
