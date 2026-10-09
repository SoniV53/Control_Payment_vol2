import { Gasto } from '../models/gasto.model';
import { GastoRecurrente } from '../models/gasto_recurrente.model';
import { GastoCuota } from '../models/gasto-cuota.model';
import { CsvRecord, ImportRow } from '../models/import-row.model';

export const CSV_HEADERS = ['titulo', 'monto', 'categoriaNum', 'tipo', 'tipomonto', 'cuotas', 'cuotasPagadas', 'fecha', 'estado'];

export function arrayToRecords(rows: string[][]): CsvRecord[] {
  if (rows.length === 0) return [];
  
  const header = rows[0].map(h => h.trim());
  const expectedHeader = CSV_HEADERS.join(',');
  if (header.join(',') !== expectedHeader) {
    throw new Error(`Cabecera inválida.\nSe encontró: ${header.join(',')}\nSe esperaba: ${expectedHeader}`);
  }

  const records: CsvRecord[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const record: CsvRecord = {};
    for (let j = 0; j < header.length; j++) {
      record[header[j]] = row[j] ?? '';
    }
    records.push(record);
  }
  return records;
}

export function mapRecordsToImportRows(records: CsvRecord[]): ImportRow[] {
  return records.map((record, index) => {
    const row: ImportRow = {
      line: index + 2,
      raw: record,
      gasto: null,
      cuotasPagadas: 0,
      categoriaId: null,
      status: 'ok',
      duplicateAction: 'ignorar',
      errors: []
    };

    try {
      const { gasto, cuotasPagadas } = validateAndMapRecord(record);
      row.gasto = gasto;
      row.cuotasPagadas = cuotasPagadas;
      row.categoriaId = gasto.categoria_id || null;
    } catch (e: any) {
      row.status = 'error-formato';
      row.errors.push(e.message || 'Error de formato');
    }

    return row;
  });
}

export function validateAndMapRecord(record: CsvRecord): { gasto: Gasto, cuotasPagadas: number } {
  if (!record['titulo'] || record['titulo'].trim() === '') {
    throw new Error('El título es requerido.');
  }

  const montoStr = record['monto'];
  if (!montoStr || montoStr.trim() === '') {
    throw new Error('El monto es requerido.');
  }
  const monto = parseFloat(montoStr);
  if (isNaN(monto) || monto <= 0) {
    throw new Error('El monto debe ser un número mayor a cero.');
  }

  const tipoCsv = record['tipo']?.toUpperCase();
  if (!['U', 'C', 'R'].includes(tipoCsv)) {
    throw new Error('El tipo debe ser U, C o R.');
  }

  const fecha = record['fecha'];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new Error('La fecha debe tener formato YYYY-MM-DD.');
  }

  const tipo = tipoCsv === 'U' ? 'normal' : tipoCsv === 'C' ? 'cuota' : 'recurrente';
  let finalMonto = monto;
  let cuotas = 0;
  let cuotasPagadas = 0;

  if (tipo === 'cuota') {
    const tipomonto = record['tipomonto']?.toUpperCase();
    if (!['M', 'T'].includes(tipomonto)) {
      throw new Error('Para cuotas, tipomonto debe ser M o T.');
    }
    
    cuotas = parseInt(record['cuotas'], 10);
    if (isNaN(cuotas) || cuotas < 1) {
      throw new Error('Para cuotas, cuotas debe ser un número entero mayor a 0.');
    }

    cuotasPagadas = parseInt(record['cuotasPagadas'], 10) || 0;
    if (cuotasPagadas < 0 || cuotasPagadas > cuotas) {
      throw new Error('cuotasPagadas debe estar entre 0 y el total de cuotas.');
    }

    if (tipomonto === 'T') {
      finalMonto = Math.round((monto / cuotas) * 100) / 100;
    }
  } else {
    // Si no es cuota, esos campos deberían estar vacíos, pero por si acaso los ignoramos.
  }

  const catStr = record['categoriaNum'];
  if (!catStr || catStr.trim() === '') {
    throw new Error('La categoría es requerida.');
  }
  const categoria_id = parseInt(catStr, 10);
  if (isNaN(categoria_id)) {
    throw new Error('categoriaNum debe ser un número entero.');
  }

  let estado = 0;
  if (tipo !== 'cuota') {
    const est = record['estado']?.toUpperCase();
    if (est === 'P') estado = 1;
    else if (est === 'N' || !est) estado = 0;
    else if (est) throw new Error('El estado debe ser P (Pagado) o N (Pendiente) o vacío.');
  }

  const gasto: Gasto = {
    titulo: record['titulo'].trim(),
    monto: finalMonto,
    tipo: tipo,
    fecha: fecha,
    categoria_id: categoria_id,
    estado: estado
  };

  if (tipo === 'cuota') {
    gasto.cuotas = cuotas;
  }

  return { gasto, cuotasPagadas };
}

export function mapGastosToCsvRecords(
  gastos: Gasto[],
  cuotasInfo: Map<number, GastoCuota[]>,
  recurrentesActivos: GastoRecurrente[]
): CsvRecord[] {
  const records: CsvRecord[] = [];

  for (const g of gastos) {
    if (g.tipo === 'recurrente' || g.tipo === 'normal' || g.tipo === 'unico' || !g.tipo) {
      records.push({
        titulo: g.titulo,
        monto: String(g.monto),
        categoriaNum: String(g.categoria_id || ''),
        tipo: 'U',
        tipomonto: '',
        cuotas: '',
        cuotasPagadas: '',
        fecha: g.fecha,
        estado: g.estado === 1 ? 'P' : 'N'
      });
    } else if (g.tipo === 'cuota') {
      const cuotas = cuotasInfo.get(g.id!) || [];
      const cuotasPagadas = cuotas.filter(c => c.estado_cuota === 1).length;

      records.push({
        titulo: g.titulo,
        monto: String(g.monto),
        categoriaNum: String(g.categoria_id || ''),
        tipo: 'C',
        tipomonto: 'M',
        cuotas: String(g.cuotas || ''),
        cuotasPagadas: String(cuotasPagadas),
        fecha: g.fecha,
        estado: ''
      });
    }
  }

  for (const r of recurrentesActivos) {
    records.push({
      titulo: r.titulo,
      monto: String(r.monto),
      categoriaNum: String(r.categoria_id || ''),
      tipo: 'R',
      tipomonto: '',
      cuotas: '',
      cuotasPagadas: '',
      fecha: r.fechaInicio,
      estado: 'N'
    });
  }

  return records;
}

