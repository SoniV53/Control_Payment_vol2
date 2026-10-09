import { dateSearch } from 'src/app/utils/Utils';
import { ImportRow } from '../models/import-row.model';
import { Gasto } from '../models/gasto.model';

export function validateImportRows(
  rows: ImportRow[],
  activeCategoryIds: Set<number>,
  existingGastos: Gasto[]
): void {
  for (const row of rows) {
    if (row.status === 'error-formato') continue;

    const gasto = row.gasto!;
    let isInvalidCategory = false;

    // 1. Validate Category
    if (gasto.categoria_id === undefined || gasto.categoria_id === null || !activeCategoryIds.has(gasto.categoria_id)) {
      isInvalidCategory = true;
      row.status = 'categoria-invalida';
      row.errors.push(`La categoría con ID ${gasto.categoria_id} no existe o está inactiva.`);
    }

    // 2. Validate Duplicates
    const isDuplicate = existingGastos.some(existing => {
      // 1. Nombre
      if (existing.titulo.trim().toLowerCase() !== gasto.titulo.trim().toLowerCase()) return false;
      
      // 2. Fecha (Normalizar al primer día del mes porque así lo guarda la BD)
      const existingFecha = existing.fecha ? existing.fecha.trim().substring(0, 10) : '';
      const csvFechaRaw = (gasto.fecha || '').trim().substring(0, 10);
      const csvFecha = dateSearch(csvFechaRaw)[0] || csvFechaRaw;
      if (existingFecha !== csvFecha) return false;
      
      // 3. Tipo
      const existingTipo = (existing.tipo === 'unico' || !existing.tipo) ? 'normal' : existing.tipo;
      const newTipo = (gasto.tipo === 'unico' || !gasto.tipo) ? 'normal' : gasto.tipo;
      if (existingTipo !== newTipo) return false;

      // OMITIR validación de monto según solicitud del usuario

      return true;
    });

    if (isDuplicate) {
      row.errors.push('Posible gasto duplicado encontrado en el sistema.');
      if (!isInvalidCategory) {
        row.status = 'duplicado';
        row.duplicateAction = 'ignorar';
      }
    } else if (!isInvalidCategory) {
      existingGastos.push(gasto);
    }
  }
}
