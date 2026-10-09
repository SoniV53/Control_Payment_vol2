import { arrayToRecords, mapRecordsToImportRows } from './gasto-csv-mapper';
import { CsvRecord } from '../models/import-row.model';

describe('Gasto CSV Mapper', () => {
  describe('arrayToRecords', () => {
    it('should map valid array to records', () => {
      const rows = [
        ['titulo', 'monto', 'categoriaNum', 'tipo', 'tipomonto', 'cuotas', 'cuotasPagadas', 'fecha', 'estado'],
        ['Test', '100', '1', 'U', '', '', '', '2023-01-01', 'P']
      ];
      const records = arrayToRecords(rows);
      expect(records.length).toBe(1);
      expect(records[0]['titulo']).toBe('Test');
      expect(records[0]['estado']).toBe('P');
    });

    it('should throw error for invalid header', () => {
      const rows = [['titulo', 'monto', 'wrong'], ['A', '100', '1']];
      expect(() => arrayToRecords(rows)).toThrowError(/Cabecera inválida/);
    });
  });

  describe('mapRecordsToImportRows', () => {
    it('should correctly map valid normal Gasto', () => {
      const records: CsvRecord[] = [{
        'titulo': 'Internet', 'monto': '300', 'categoriaNum': '2', 'tipo': 'U',
        'tipomonto': '', 'cuotas': '', 'cuotasPagadas': '', 'fecha': '2024-05-15', 'estado': 'P'
      }];
      
      const result = mapRecordsToImportRows(records);
      expect(result.length).toBe(1);
      const row = result[0];
      expect(row.status).toBe('ok');
      expect(row.errors.length).toBe(0);
      expect(row.gasto).toBeTruthy();
      expect(row.gasto?.titulo).toBe('Internet');
      expect(row.gasto?.monto).toBe(300);
      expect(row.gasto?.tipo).toBe('normal');
      expect(row.gasto?.estado).toBe(1); // Pagado
      expect(row.categoriaId).toBe(2);
    });

    it('should map Cuota Gasto with Total amount', () => {
      const records: CsvRecord[] = [{
        'titulo': 'PC', 'monto': '1000', 'categoriaNum': '1', 'tipo': 'C',
        'tipomonto': 'T', 'cuotas': '4', 'cuotasPagadas': '1', 'fecha': '2024-05-15', 'estado': ''
      }];
      
      const result = mapRecordsToImportRows(records);
      const row = result[0];
      expect(row.status).toBe('ok');
      expect(row.gasto?.monto).toBe(250); // 1000 / 4
      expect(row.gasto?.cuotas).toBe(4);
      expect(row.cuotasPagadas).toBe(1);
    });

    it('should fail if Cuota is missing required cuota fields', () => {
      const records: CsvRecord[] = [{
        'titulo': 'PC', 'monto': '1000', 'categoriaNum': '1', 'tipo': 'C',
        'tipomonto': '', 'cuotas': '', 'cuotasPagadas': '', 'fecha': '2024-05-15', 'estado': ''
      }];
      
      const result = mapRecordsToImportRows(records);
      const row = result[0];
      expect(row.status).toBe('error-formato');
      expect(row.errors[0]).toMatch(/Para cuotas, tipomonto debe ser M o T/);
      expect(row.gasto).toBeNull();
    });

    it('should fail with invalid date format', () => {
      const records: CsvRecord[] = [{
        'titulo': 'PC', 'monto': '1000', 'categoriaNum': '1', 'tipo': 'U',
        'tipomonto': '', 'cuotas': '', 'cuotasPagadas': '', 'fecha': '15/05/2024', 'estado': ''
      }];
      
      const result = mapRecordsToImportRows(records);
      expect(result[0].status).toBe('error-formato');
      expect(result[0].errors[0]).toMatch(/La fecha debe tener formato YYYY-MM-DD/);
    });
  });
});
