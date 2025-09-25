
// Este archivo ahora importa la implementación desde exportarCompleto.js
// para mantener la compatibilidad con código existente
import { exportarTodoXlsx } from './exportarCompleto.js';

// Función para exportar todas las tablas a Excel
// Ahora simplemente redirige a la nueva implementación
async function exportarTodoExcel(req, res) {
  // Redirigir a la nueva implementación
  return exportarTodoXlsx(req, res);
}

export { exportarTodoExcel };