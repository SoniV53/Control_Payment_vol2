import { Gasto } from './gasto.model';

export type CsvRecord = Record<string, string>;

export interface ImportRow {
  line: number;
  raw: CsvRecord;
  gasto: Gasto | null;
  cuotasPagadas: number;
  categoriaId: number | null;
  status: 'ok' | 'categoria-invalida' | 'duplicado' | 'error-formato';
  duplicateAction: 'ignorar' | 'forzar';
  errors: string[];
}
