import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon } from '@ionic/angular/standalone';
import { SelectorModalComponent } from 'src/app/component/input/selector-modal/selector-modal.component';
import { getIconPath } from 'src/app/utils/Utils';
import { ImportRow } from 'src/app/core/models/import-row.model';
import { Categoria } from 'src/app/core/models/categoria.model';
import { CategoriaServiceService } from 'src/app/services/categoria-service.service';
import { GastoImportExportService } from 'src/app/services/gasto-import-export.service';
import { DatabaseServiceService } from 'src/app/core/database/database-service.service';
import { validateImportRows } from 'src/app/core/csv/import-validator';
import { validateAndMapRecord } from 'src/app/core/csv/gasto-csv-mapper';

@Component({
  selector: 'app-csv-preview-step',
  templateUrl: './csv-preview-step.component.html',
  styleUrls: ['./csv-preview-step.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, SelectorModalComponent]
})
export class CsvPreviewStepComponent implements OnInit {
  @Input() rows: ImportRow[] = [];
  @Output() onBack = new EventEmitter<void>();
  @Output() onImport = new EventEmitter<void>();

  categorias: Categoria[] = [];
  categoriasMapeadas: any[] = [];

  constructor(
    private categoriaService: CategoriaServiceService,
    private dbService: DatabaseServiceService
  ) {}

  async ngOnInit() {
    this.categorias = await this.categoriaService.getCategorias();
    this.categorias = this.categorias.filter(c => c.activo === 1);
    this.categoriasMapeadas = this.categorias.map(c => ({ code: c.id, value: c.nombre, icon: c.icono || 'pricetags-outline' }));
  }

  get canImport(): boolean {
    if (this.rows.length === 0) return false;
    // Blok if there are unresolved format errors or invalid categories
    const hasFormatError = this.rows.some(r => r.status === 'error-formato');
    const hasInvalidCat = this.rows.some(r => r.status === 'categoria-invalida');
    return !hasFormatError && !hasInvalidCat;
  }

  async resolveCategory(row: ImportRow, newCatId: any) {
    row.categoriaId = Number(newCatId);
    row.gasto!.categoria_id = row.categoriaId;
    row.status = 'ok';
    row.errors = [];
    
    // Re-run validation on this row to see if it's now a duplicate
    const activeCategoryIds = new Set(this.categorias.map(c => c.id!));
    const db = await this.dbService.getDB();
    const result = await db.query(`SELECT * FROM gasto WHERE estado != 2 OR estado IS NULL`);
    
    validateImportRows([row], activeCategoryIds, result.values || []);
  }

  getIcon(name: string) { return getIconPath(name); }

  async reprocesarFila(row: ImportRow) {
    try {
      const { gasto, cuotasPagadas } = validateAndMapRecord(row.raw);
      row.gasto = gasto;
      row.cuotasPagadas = cuotasPagadas;
      row.categoriaId = gasto.categoria_id || null;
      row.status = 'ok';
      row.errors = [];
      
      const activeCategoryIds = new Set(this.categorias.map(c => c.id!));
      const db = await this.dbService.getDB();
      const result = await db.query('SELECT * FROM gasto WHERE estado != 2 OR estado IS NULL');
      
      validateImportRows([row], activeCategoryIds, result.values || []);
    } catch (e: any) {
      row.status = 'error-formato';
      row.errors = [e.message || 'Error de formato'];
    }
  }

  getCategoryName(id: number | null): string {
    if (!id) return 'Desconocida';
    const cat = this.categorias.find(c => c.id === id);
    return cat ? cat.nombre : 'Desconocida';
  }

  getTipoLabel(tipo: string): string {
    if (tipo === 'normal' || tipo === 'unico') return 'Único';
    if (tipo === 'cuota') return 'Cuota';
    if (tipo === 'recurrente') return 'Recurrente';
    return tipo;
  }
}



