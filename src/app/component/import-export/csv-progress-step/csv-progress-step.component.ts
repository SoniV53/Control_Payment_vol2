import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportRow } from 'src/app/core/models/import-row.model';
import { GastoImportExportService, ImportResult } from 'src/app/services/gasto-import-export.service';
import { IonIcon } from '@ionic/angular/standalone';
import { getIconPath } from 'src/app/utils/Utils';

@Component({
  selector: 'app-csv-progress-step',
  templateUrl: './csv-progress-step.component.html',
  styleUrls: ['./csv-progress-step.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class CsvProgressStepComponent implements OnInit {
  @Input() rows: ImportRow[] = [];
  @Output() onDone = new EventEmitter<void>();
  @Output() onReset = new EventEmitter<void>();

  isProcessing = true;
  currentProgress = 0;
  total = 0;
  result: ImportResult | null = null;

  constructor(private importExportService: GastoImportExportService) {}

  async ngOnInit() {
    this.total = this.rows.filter(r => r.status === 'ok' || r.status === 'duplicado').length;
    
    this.result = await this.importExportService.importGastos(this.rows, (current, total) => {
      this.currentProgress = current;
      this.total = total;
    });

    this.isProcessing = false;
    this.onDone.emit();
  }

  getIcon(name: string) { return getIconPath(name); }

  get progressPercentage(): number {
    if (this.total === 0) return 100;
    return (this.currentProgress / this.total) * 100;
  }
}

