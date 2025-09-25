// Este archivo crea una exportación de Excel con todas las tablas
import ExcelJS from 'exceljs';
import sequelize from '../db/connection.js';

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
import prestamocorrienteModel from '../models/prestamocorrienteModel.js';

/**
 * Exporta todas las tablas del sistema a un archivo Excel
 */
async function exportarTodoCompleto(req, res) {
  try {
    console.log("Iniciando exportación completa con ExcelJS...");
    
    // Crear un nuevo libro de trabajo
    const workbook = new ExcelJS.Workbook();
    
    // Agregar metadatos
    workbook.creator = 'Sistema Banco de Herramientas';
    workbook.lastModifiedBy = 'Sistema de Exportación';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Función auxiliar para crear una hoja con datos y formatearla
    const crearHoja = async (nombre, modelo, opciones = {}) => {
      try {
        console.log(`Creando hoja: ${nombre}...`);
        const datos = await modelo.findAll(opciones.where ? { where: opciones.where } : {});
        
        if (!datos || datos.length === 0) {
          console.log(`No hay datos para la hoja: ${nombre}`);
          const ws = workbook.addWorksheet(nombre);
          ws.addRow(['No hay datos disponibles']);
          return;
        }

        const ws = workbook.addWorksheet(nombre);
        
        // Extraer encabezados de los datos
        const encabezados = Object.keys(datos[0].dataValues).map(key => ({ 
          header: key, 
          key, 
          width: 15 // Ancho predeterminado
        }));
        
        // Ajustar anchos para columnas específicas
        encabezados.forEach(col => {
          if (col.key.includes('nombre') || col.key.includes('descripcion')) {
            col.width = 30;
          } else if (col.key.includes('fecha')) {
            col.width = 20;
          } else if (col.key.includes('id')) {
            col.width = 10;
          }
        });
        
        ws.columns = encabezados;
        
        // Aplicar estilo a los encabezados
        ws.getRow(1).font = { bold: true };
        ws.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD3D3D3' } // Color gris claro
        };
        
        // Agregar los datos
        datos.forEach(item => {
          const fila = {};
          Object.keys(item.dataValues).forEach(key => {
            // Convertir fechas a formato legible
            if (item.dataValues[key] instanceof Date) {
              fila[key] = item.dataValues[key].toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
            } else {
              fila[key] = item.dataValues[key];
            }
          });
          ws.addRow(fila);
        });
        
        // Aplicar autofilter
        ws.autoFilter = {
          from: { row: 1, column: 1 },
          to: { row: 1, column: encabezados.length }
        };
        
        console.log(`Hoja ${nombre} creada con ${datos.length} registros`);
        return ws;
      } catch (error) {
        console.error(`Error al crear hoja ${nombre}:`, error);
        const ws = workbook.addWorksheet(nombre);
        ws.addRow(['Error al cargar datos']);
        ws.addRow([error.message]);
        return ws;
      }
    };
    
    // Crear todas las hojas solicitadas
    await crearHoja('Elementos Prestados', elementoHasPrestamocorrienteModel, { 
      where: { estado: 'actual' } 
    });
    
    await crearHoja('Historial Préstamos', historialModel);
    
    await crearHoja('Préstamos Especiales', prestamoespecialModel, { 
      where: { estado: 'actual' } 
    });
    
    await crearHoja('Historial Prést. Especiales', elementoHasPrestamoespecialModel);
    
    await crearHoja('Consumos', consumoModel);
    
    await crearHoja('Historial Consumos', elementoHasConsumoModel);
    
    await crearHoja('Encargos', encargoModel);
    
    // Historial de Encargos con formato igual al frontend
    try {
      console.log(`Creando hoja: Historial Encargos...`);
      
      // Usamos una query SQL directa para obtener exactamente lo que necesitamos
      const [historialEncargos] = await sequelize.query(`
        SELECT 
          e.idencargo AS codigo_pres,
          c.documento,
          c.nombre,
          ehe.elementos_idelemento AS elemento,
          el.descripcion,
          ehe.cantidad,
          ehe.observaciones,
          ehe.estado,
          ehe.fecha_devolucion,
          a.documento AS admin_documento
        FROM 
          elementos_has_encargos ehe
        JOIN encargos e ON ehe.encargos_idencargo = e.idencargo
        JOIN elementos el ON ehe.elementos_idelemento = el.idelemento
        JOIN clientes c ON e.clientes_documento = c.documento
        LEFT JOIN areas ar ON e.areas_idarea = ar.idarea
        LEFT JOIN administradores a ON ar.idarea = a.areas_idarea
        ORDER BY ehe.fecha_devolucion DESC
      `);
      
      if (!historialEncargos || historialEncargos.length === 0) {
        console.log(`No hay datos para Historial Encargos`);
        const ws = workbook.addWorksheet('Historial Encargos');
        ws.addRow(['No hay datos disponibles']);
        return;
      }

      const ws = workbook.addWorksheet('Historial Encargos');
      
      // Definir las columnas como en el frontend
      ws.columns = [
        { header: 'Código Pres', key: 'codigo_pres', width: 10 },
        { header: 'Documento', key: 'documento', width: 15 },
        { header: 'Nombre', key: 'nombre', width: 25 },
        { header: 'Elemento', key: 'elemento', width: 10 },
        { header: 'Descripción', key: 'descripcion', width: 25 },
        { header: 'Cantidad', key: 'cantidad', width: 10 },
        { header: 'Observaciones', key: 'observaciones', width: 30 },
        { header: 'Estado', key: 'estado', width: 12 },
        { header: 'Acción', key: 'accion', width: 15 },
        { header: 'Fecha', key: 'fecha', width: 20 },
        { header: 'Admin', key: 'admin', width: 15 }
      ];
      
      // Aplicar estilo a los encabezados
      ws.getRow(1).font = { bold: true };
      ws.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' } // Color gris claro
      };
      
      // Agregar los datos transformados
      historialEncargos.forEach(item => {
        // Determinar la acción basada en el estado
        let accion = '';
        if (item.estado === 'aceptado') {
          accion = 'ACEPTAR ENCARGO';
        } else if (item.estado === 'rechazado') {
          accion = 'RECHAZAR ENCARGO';
        } else {
          accion = 'PENDIENTE';
        }
        
        // Formatear la fecha si existe
        let fechaFormateada = '';
        if (item.fecha_devolucion) {
          const fecha = new Date(item.fecha_devolucion);
          fechaFormateada = fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
        
        ws.addRow({
          codigo_pres: item.codigo_pres,
          documento: item.documento,
          nombre: item.nombre,
          elemento: item.elemento,
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          observaciones: item.observaciones || '',
          estado: item.estado,
          accion: accion,
          fecha: fechaFormateada,
          admin: item.admin_documento || ''
        });
      });
      
      // Aplicar autofilter
      ws.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: 11 }
      };
      
      // Aplicar estilos a las filas para mejor legibilidad
      for (let i = 2; i <= historialEncargos.length + 1; i++) {
        if (i % 2 === 0) {
          ws.getRow(i).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9F9F9' } // Gris muy claro
          };
        }
        
        // Colorear según estado
        const estado = ws.getCell(`H${i}`).value;
        if (estado === 'rechazado') {
          ws.getCell(`H${i}`).font = { color: { argb: 'FFFF0000' } }; // Rojo
        } else if (estado === 'aceptado') {
          ws.getCell(`H${i}`).font = { color: { argb: 'FF008000' } }; // Verde
        }
      }
      
      console.log(`Hoja Historial Encargos creada con ${historialEncargos.length} registros`);
    } catch (error) {
      console.error(`Error al crear hoja Historial Encargos:`, error);
      const ws = workbook.addWorksheet('Historial Encargos');
      ws.addRow(['Error al cargar datos']);
      ws.addRow([error.message]);
    }
    
    await crearHoja('Moras Activas', moraModel);
    
    await crearHoja('Historial Moras', moraModel);
    
    await crearHoja('Daños Pendientes', bajaModel, { 
      where: { tipo: 'daño', estado: 'pendiente' } 
    });
    
    await crearHoja('Historial Daños', bajaModel, { 
      where: { tipo: 'daño', estado: 'historial' } 
    });
    
    await crearHoja('Clientes', clienteModel);
    
    await crearHoja('Grupos', areaModel);
    
    await crearHoja('Elementos', elementoModel);
    
    await crearHoja('Administradores', administradorModel);
    
    await crearHoja('Reintegros', reintegroModel);
    
    await crearHoja('Traspasos', traspasoModel);
    
    // Crear hoja de resumen
    const resumenSheet = workbook.addWorksheet('Resumen');
    resumenSheet.columns = [
      { header: 'Tabla', key: 'tabla', width: 30 },
      { header: 'Cantidad de Registros', key: 'cantidad', width: 20 }
    ];
    
    // Estilo para el encabezado del resumen
    resumenSheet.getRow(1).font = { bold: true };
    resumenSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F81BD' } // Azul
    };
    resumenSheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
    
    // Agregar información de cada hoja
    let rowIndex = 2;
    workbook.eachSheet((sheet, id) => {
      if (sheet.name !== 'Resumen') {
        resumenSheet.addRow({ 
          tabla: sheet.name, 
          cantidad: sheet.rowCount > 1 ? sheet.rowCount - 1 : 0 
        });
        
        // Alternar colores de fondo para mejor legibilidad
        if (rowIndex % 2 === 0) {
          resumenSheet.getRow(rowIndex).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF2F2F2' } // Gris muy claro
          };
        }
        rowIndex++;
      }
    });
    
    // Establecer los encabezados de respuesta HTTP
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=exportacion_completa.xlsx');
    
    // Escribir directamente a la respuesta (stream)
    await workbook.xlsx.write(res);
    
    // Finalizar la respuesta
    res.end();
    
    console.log("Exportación ExcelJS completada con éxito");
  } catch (error) {
    console.error("Error en exportación ExcelJS:", error);
    
    // Si hay un error, intentar devolver un JSON con el error
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Error al generar Excel', 
        message: error.message 
      });
    } else {
      // Si ya se enviaron los headers, simplemente finalizamos la respuesta
      res.end();
    }
  }
}

// Exportar la función con el nombre que espera el enrutador
export { exportarTodoCompleto as exportarTodoXlsx };