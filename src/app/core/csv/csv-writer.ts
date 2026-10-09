import { CsvRecord } from '../models/import-row.model';
import { CSV_HEADERS } from './gasto-csv-mapper';

export function writeCsv(records: CsvRecord[]): string {
  const lines: string[] = [];
  
  // Header
  lines.push(CSV_HEADERS.join(','));

  // Rows
  for (const record of records) {
    const row = CSV_HEADERS.map(header => {
      const val = record[header] ?? '';
      return escapeCsvField(String(val));
    });
    lines.push(row.join(','));
  }

  return lines.join('\n');
}

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r')) {
    return '"' + field.replace(/"/g, '""') + '"';
  }
  return field;
}
