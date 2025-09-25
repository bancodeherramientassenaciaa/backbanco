import * as XLSX from 'xlsx';

// Importar modelos
import elementoModel from '../models/elementoModel.js';
import elementoHasPrestamocorrienteModel from '../models/elementoHasPrestamocorrienteModel.js';
import historialModel from '../models/historialModel.js';
import prestamoespecialModel from '../models/prestamoespecialModel.js';
import elementoHasPrestamoespecialModel from '../models/elementoHasPrestamoespecialModel.js';
import consumoModel from '../models/consumoModel.js';
import elementoHasConsumoModel from '../models/elementoHasConsumoModel.js';
import encargoModel from '../models/encargoModel.js';
import elementoHasEncargoModel from '../models/elementoHasEncargoModel.js';
import moraModel from '../models/moraModel.js';
import clienteModel from '../models/clienteModel.js';
import areaModel from '../models/areaModel.js';
import administradorModel from '../models/administradorModel.js';
import bajaModel from '../models/bajaModel.js';
import reintegroModel from '../models/reintegroModel.js';
import traspasoModel from '../models/traspasoModel.js';

/**
 * Convierte objetos de Sequelize a objetos planos para XLSX
 */
function convertirAObjetoPlano(objeto) {
  if (!objeto) return {};
  if (objeto.dataValues) {
    const result = {...objeto.dataValues};
    // Convertir fechas a string en formato ISO para evitar problemas con XLSX
    Object.keys(result).forEach(key => {
      if (result[key] instanceof Date) {
        result[key] = result[key].toISOString();
      }
    });
    return result;
  }
  return objeto;
}

/**
 * Exporta todos los datos a Excel usando XLSX
 */
async function exportarTodoXlsx(req, res) {
  try {
    // Crear un libro de trabajo
    const workbook = XLSX.utils.book_new();
    
    // Consultar datos
    const historialPrestamos = await historialModel.findAll();
    const prestamosEspeciales = await prestamoespecialModel.findAll();
    const historialPrestamosEspeciales = await elementoHasPrestamoespecialModel.findAll();
    const consumos = await consumoModel.findAll();
    const historialConsumos = await elementoHasConsumoModel.findAll();
    const encargos = await encargoModel.findAll();
    const historialEncargos = await elementoHasEncargoModel.findAll();
    const morasActivas = await moraModel.findAll({ where: { estado: 'activa' } });
    const historialMoras = await moraModel.findAll({ where: { estado: 'historial' } });
    const danosPendientes = await bajaModel.findAll({ where: { tipo: 'daño', estado: 'pendiente' } });
    const historialDanos = await bajaModel.findAll({ where: { tipo: 'daño', estado: 'historial' } });
    const clientes = await clienteModel.findAll();
    const grupos = await areaModel.findAll();
    const elementos = await elementoModel.findAll();
    const administradores = await administradorModel.findAll();
    const reintegros = await reintegroModel.findAll();
    const traspasos = await traspasoModel.findAll();
    
    // Función para crear una hoja con datos
    const crearHoja = (nombre, datos) => {
      if (!datos || datos.length === 0) {
        // Si no hay datos, crear una hoja con mensaje
        const ws = XLSX.utils.aoa_to_sheet([['No hay datos disponibles']]);
        XLSX.utils.book_append_sheet(workbook, ws, nombre);
        return;
      }
      
      // Convertir objetos de Sequelize a objetos planos
      const datosPlanos = datos.map(item => convertirAObjetoPlano(item));
      
      // Crear worksheet con los datos
      const ws = XLSX.utils.json_to_sheet(datosPlanos);
      
      // Añadir la hoja al libro
      XLSX.utils.book_append_sheet(workbook, ws, nombre);
    };
    
    // Crear hojas para cada conjunto de datos
    crearHoja('Historial Préstamos', historialPrestamos);
    crearHoja('Préstamos Especiales', prestamosEspeciales);
    crearHoja('Historial Prést. Especiales', historialPrestamosEspeciales);
    crearHoja('Consumos', consumos);
    crearHoja('Historial Consumos', historialConsumos);
    crearHoja('Encargos', encargos);
    crearHoja('Historial Encargos', historialEncargos);
    crearHoja('Moras Activas', morasActivas);
    crearHoja('Historial Moras', historialMoras);
    crearHoja('Daños Pendientes', danosPendientes);
    crearHoja('Historial Daños', historialDanos);
    crearHoja('Clientes', clientes);
    crearHoja('Grupos', grupos);
    crearHoja('Elementos', elementos);
    crearHoja('Administradores', administradores);
    crearHoja('Reintegros', reintegros);
    crearHoja('Traspasos', traspasos);
    
    // Generar buffer para el archivo
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      bookSST: false
    });
    
    // Establecer cabeceras para la descarga
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="exportacion_completa.xlsx"');
    res.setHeader('Content-Length', excelBuffer.length);
    
    // Enviar el buffer
    return res.send(excelBuffer);
    
  } catch (error) {
    console.error('Error al exportar Excel:', error);
    
    // Generar un libro de Excel con mensaje de error
    try {
      const workbook = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([
        ['Error al exportar datos'],
        [error.message || 'Error desconocido']
      ]);
      XLSX.utils.book_append_sheet(workbook, ws, 'Error');
      
      const errorBuffer = XLSX.write(workbook, { 
        type: 'buffer', 
        bookType: 'xlsx' 
      });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="error_exportacion.xlsx"');
      return res.send(errorBuffer);
      
    } catch (fallbackError) {
      // Si también falla la generación del Excel de error, devolver JSON
      return res.status(500).json({ 
        error: 'Error al generar Excel', 
        message: error.message,
        fallback: fallbackError.message
      });
    }
  }
}

export { exportarTodoXlsx };