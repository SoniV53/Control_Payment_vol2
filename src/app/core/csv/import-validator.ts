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
      if (existing.titulo.trim().toLowerCase() !== gasto.titulo.trim().toLowerCase()) return false;
      const existingFecha = existing.fecha ? existing.fecha.substring(0, 10) : '';
      const newFecha = gasto.fecha ? gasto.fecha.substring(0, 10) : '';
      if (existingFecha !== newFecha) return false;
      const existingTipo = (existing.tipo === 'unico' || !existing.tipo) ? 'normal' : existing.tipo;
      const newTipo = (gasto.tipo === 'unico' || !gasto.tipo) ? 'normal' : gasto.tipo;
      if (existingTipo !== newTipo) return false;

      const existingMontoTotal = existingTipo === 'cuota' ? (Number(existing.monto) * (Number(existing.cuotas) || 1)) : Number(existing.monto);
      const newMontoTotal = newTipo === 'cuota' ? (Number(gasto.monto) * (Number(gasto.cuotas) || 1)) : Number(gasto.monto);

      if (Math.abs(existingMontoTotal - newMontoTotal) > 0.01) return false;

      return true;
    });

    if (isDuplicate) {
      row.errors.push('Posible gasto duplicado encontrado en el sistema.');
      if (!isInvalidCategory) {
        row.status = 'duplicado';
      }
    }
  }
}



