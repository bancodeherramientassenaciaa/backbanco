import * as XLSX from 'xlsx';

/**
 * Exporta un archivo Excel simple para probar la generación de archivos
 */
async function exportarTodoXlsx(req, res) {
  try {
    console.log("Iniciando exportación a Excel...");
    
    // Crear un libro Excel básico con datos de ejemplo para probar
    const workbook = XLSX.utils.book_new();
    
    // Crear una hoja simple con algunos datos
    const data = [
      ["ID", "Nombre", "Descripción", "Fecha"],
      [1, "Elemento 1", "Descripción del elemento 1", new Date().toISOString()],
      [2, "Elemento 2", "Descripción del elemento 2", new Date().toISOString()],
      [3, "Elemento 3", "Descripción del elemento 3", new Date().toISOString()]
    ];
    
    // Convertir datos a una hoja
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    
    // Añadir la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos de prueba");
    
    // Generar el archivo como array buffer (no como buffer)
    const excelBuffer = XLSX.write(workbook, { 
      type: 'array',  // Cambiado a array en lugar de buffer
      bookType: 'xlsx'
    });
    
    // Crear Buffer desde ArrayBuffer
    const nodeBuffer = Buffer.from(excelBuffer);
    
    // Configurar cabeceras HTTP
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=exportacion_test.xlsx');
    res.setHeader('Content-Length', nodeBuffer.length);
    
    // Enviar la respuesta
    res.status(200).send(nodeBuffer);
    
    console.log("Exportación Excel completada con éxito");
  } catch (error) {
    console.error("Error en exportación Excel:", error);
    res.status(500).json({ error: 'Error al generar Excel', message: error.message });
  }
}

export { exportarTodoXlsx };