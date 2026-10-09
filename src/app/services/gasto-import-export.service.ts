import { Injectable } from '@angular/core';
import { GastoServiceService } from './gasto-service.service';
import { CategoriaServiceService } from './categoria-service.service';
import { ImportRow } from '../core/models/import-row.model';
import { Gasto } from '../core/models/gasto.model';
import { GastoCuota } from '../core/models/gasto-cuota.model';
import { GastoRecurrente } from '../core/models/gasto_recurrente.model';
import { parseCsv } from '../core/csv/csv-parser';
import { arrayToRecords, mapRecordsToImportRows, mapGastosToCsvRecords } from '../core/csv/gasto-csv-mapper';
import { validateImportRows } from '../core/csv/import-validator';
import { writeCsv } from '../core/csv/csv-writer';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { DatabaseServiceService } from '../core/database/database-service.service';

export interface ImportResult {
  total: number;
  imported: number;
  ignored: number;
  failed: number;
  errors: { line: number, error: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class GastoImportExportService {

  constructor(
    private gastoService: GastoServiceService,
    private categoriaService: CategoriaServiceService,
    private dbService: DatabaseServiceService
  ) { }

  async parseAndValidateCsv(csvText: string): Promise<ImportRow[]> {
    const rawRows = parseCsv(csvText);
    const records = arrayToRecords(rawRows);
    const importRows = mapRecordsToImportRows(records);

    // Get active categories
    const categories = await this.categoriaService.getCategorias();
    const activeCategoryIds = new Set(categories.filter(c => c.activo === 1).map(c => c.id!));

    const db = await this.dbService.getDB();
    const result = await db.query(`SELECT * FROM gasto WHERE estado != 2 OR estado IS NULL`);
    const existingGastos: Gasto[] = result.values || [];

    validateImportRows(importRows, activeCategoryIds, existingGastos);

    return importRows;
  }

  async importGastos(rows: ImportRow[], onProgress?: (current: number, total: number) => void): Promise<ImportResult> {
    const validRows = rows.filter(r => r.status === 'ok' || r.status === 'duplicado');
    const result: ImportResult = { total: validRows.length, imported: 0, ignored: 0, failed: 0, errors: [] };

    let processed = 0;
    for (const row of validRows) {
      if (row.status === 'duplicado' && row.duplicateAction === 'ignorar') {
        result.ignored++;
        processed++;
        if (onProgress) onProgress(processed, result.total);
        continue;
      }

      try {
        const gasto = row.gasto!;
        
        if (row.categoriaId) {
          gasto.categoria_id = row.categoriaId;
        }

        const isRecurrente = gasto.tipo === 'recurrente';
        
        await this.gastoService.addGasto(gasto, gasto.fecha, isRecurrente, row.cuotasPagadas);
        result.imported++;
      } catch (e: any) {
        result.failed++;
        result.errors.push({ line: row.line, error: e.message || String(e) });
      }

      processed++;
      if (onProgress) onProgress(processed, result.total);
    }

    return result;
  }

  async exportGastos(): Promise<string> {
    const db = await this.dbService.getDB();
    const result = await db.query(`SELECT * FROM gasto WHERE estado != 2 OR estado IS NULL`);
    const gastos: Gasto[] = result.values || [];

    const cuotasInfo = new Map<number, GastoCuota[]>();
    for (const g of gastos) {
      if (g.tipo === 'cuota' && g.id) {
        const cuotas = await this.gastoService.getCuotasByGasto(g.id);
        cuotasInfo.set(g.id, cuotas);
      }
    }

    const recurrentes = await this.gastoService.getGastosRecurrentes(true);
    const records = mapGastosToCsvRecords(gastos, cuotasInfo, recurrentes);
    const csvContent = writeCsv(records);
    const fileName = `gastos_${new Date().toISOString().split('T')[0]}.csv`;

    if (Capacitor.isNativePlatform()) {
      let savedUri = '';
      try {
        const writeResult = await Filesystem.writeFile({
          path: 'Download/' + fileName,
          data: csvContent,
          directory: Directory.ExternalStorage,
          encoding: Encoding.UTF8
        });
        savedUri = writeResult.uri;
      } catch (e) {
        const writeResult = await Filesystem.writeFile({
          path: fileName,
          data: csvContent,
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });
        savedUri = writeResult.uri;
      }

      try {
        await Share.share({
          title: 'Exportación de Gastos',
          text: 'Gastos exportados en CSV.',
          url: savedUri,
          dialogTitle: 'Compartir exportación CSV'
        });
      } catch(e) {}

      return savedUri;
    } else {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return 'Descargado localmente (Navegador)';
    }
  }
}


