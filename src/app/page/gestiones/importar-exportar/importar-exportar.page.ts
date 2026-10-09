import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonIcon } from '@ionic/angular/standalone';
import { BannerTopComponent } from "src/app/component/card/banner-top/banner-top.component";
import { CustomTabsComponent } from "src/app/component/custom-tabs/custom-tabs.component";
import { ImportRow } from 'src/app/core/models/import-row.model';
import { GastoImportExportService } from 'src/app/services/gasto-import-export.service';
import { BasePage } from '../../main/base/base.page';

import { CsvInputStepComponent } from 'src/app/component/import-export/csv-input-step/csv-input-step.component';
import { CsvPreviewStepComponent } from 'src/app/component/import-export/csv-preview-step/csv-preview-step.component';
import { CsvProgressStepComponent } from 'src/app/component/import-export/csv-progress-step/csv-progress-step.component';

@Component({
  selector: 'app-importar-exportar',
  templateUrl: './importar-exportar.page.html',
  styleUrls: ['./importar-exportar.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonIcon,
    CommonModule, FormsModule, BannerTopComponent, CustomTabsComponent,
    CsvInputStepComponent, CsvPreviewStepComponent, CsvProgressStepComponent
  ]
})
export class ImportarExportarPage extends BasePage implements OnInit {
  toolBar = {
    title: "Datos",
    description: "Importa o exporta tus gastos en formato CSV.",
  };

  currentTab: string = 'importar';
  tabList = [
    { id: 'importar', label: 'Importar', icon: 'cloud-upload-outline' },
    { id: 'exportar', label: 'Exportar', icon: 'cloud-download-outline' }
  ];

  // Import State
  importStep: number = 1; // 1: Input, 2: Preview, 3: Progress
  parsedRows: ImportRow[] = [];
  currentCsvText: string = '';
  
  // Export State
  isExporting = false;
  exportSuccess = false;
  exportError = '';

  private importExportService = inject(GastoImportExportService);

  ngOnInit() { }

  // --- IMPORT FLOW ---
  async handleCsvLoaded(csvText: string) {
    this.currentCsvText = csvText;
    try {
      this.parsedRows = await this.importExportService.parseAndValidateCsv(csvText);
      this.importStep = 2; // Go to preview
    } catch (e: any) {
      alert("Error leyendo CSV: " + e.message);
    }
  }

  handleBackToInput() {
    this.importStep = 1;
    this.parsedRows = [];
  }

  handleStartImport() {
    this.importStep = 3;
    // CsvProgressStepComponent takes over and calls the service
  }

  handleImportFinished() {
    // We can show a done message or back to start
  }

  handleImportReset() {
    this.importStep = 1;
    this.parsedRows = [];
  }

  // --- EXPORT FLOW ---
  async handleExport() {
    this.isExporting = true;
    this.exportSuccess = false;
    this.exportError = '';
    
    try {
      const path = await this.importExportService.exportGastos();
      this.exportSuccess = true;
      alert('¡Exportación Exitosa!\\nEl archivo se guardó físicamente en tu dispositivo:\\n' + path);
    } catch (e: any) {
      this.exportError = e.message || 'Error al exportar.';
    } finally {
      this.isExporting = false;
    }
  }
}



