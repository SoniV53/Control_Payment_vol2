import { validateImportRows } from './import-validator';
import { ImportRow } from '../models/import-row.model';
import { Gasto } from '../models/gasto.model';

describe('Import Validator', () => {
  let rows: ImportRow[];
  let activeCategories: Set<number>;
  let existingGastos: Gasto[];

  beforeEach(() => {
    rows = [
      {
        line: 2,
        raw: {},
        gasto: { titulo: 'Test', monto: 100, fecha: '2024-01-01', tipo: 'normal', categoria_id: 1, estado: 0 },
        cuotasPagadas: 0,
        categoriaId: 1,
        status: 'ok',
        duplicateAction: 'ignorar',
        errors: []
      }
    ];
    activeCategories = new Set([1, 2]);
    existingGastos = [];
  });

  it('should pass valid row without changing status', () => {
    validateImportRows(rows, activeCategories, existingGastos);
    expect(rows[0].status).toBe('ok');
    expect(rows[0].errors.length).toBe(0);
  });

  it('should mark invalid category', () => {
    rows[0].gasto!.categoria_id = 99;
    validateImportRows(rows, activeCategories, existingGastos);
    expect(rows[0].status).toBe('categoria-invalida');
    expect(rows[0].errors[0]).toMatch(/La categoría con ID 99 no existe/);
  });

  it('should mark duplicate', () => {
    existingGastos.push({
      titulo: 'test ', // different case/spacing
      monto: 100,
      fecha: '2024-01-01',
      tipo: 'normal',
      categoria_id: 2
    });
    validateImportRows(rows, activeCategories, existingGastos);
    expect(rows[0].status).toBe('duplicado');
    expect(rows[0].errors[0]).toMatch(/duplicado/);
  });

  it('should mark duplicate for cuota based on total amount', () => {
    rows[0].gasto = { titulo: 'Cuota', monto: 50, cuotas: 4, fecha: '2024-01-01', tipo: 'cuota', categoria_id: 1 };
    
    // Existing is 100 monthly * 2 cuotas = 200 total (same as new 50 * 4)
    existingGastos.push({
      titulo: 'cuota',
      monto: 100,
      cuotas: 2,
      fecha: '2024-01-01',
      tipo: 'cuota',
      categoria_id: 1
    });

    validateImportRows(rows, activeCategories, existingGastos);
    expect(rows[0].status).toBe('duplicado');
  });

  it('should prioritize categoria-invalida status over duplicado', () => {
    rows[0].gasto!.categoria_id = 99;
    existingGastos.push({
      titulo: 'Test',
      monto: 100,
      fecha: '2024-01-01',
      tipo: 'normal',
      categoria_id: 1
    });
    
    validateImportRows(rows, activeCategories, existingGastos);
    expect(rows[0].status).toBe('categoria-invalida');
    expect(rows[0].errors.length).toBe(2);
  });
});
