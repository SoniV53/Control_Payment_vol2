import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CategoriaServiceService } from 'src/app/services/categoria-service.service';
import { Categoria } from 'src/app/core/models/categoria.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent } from '@ionic/angular/standalone';
import { getIconPath } from 'src/app/utils/Utils';

@Component({
  selector: 'app-csv-input-step',
  templateUrl: './csv-input-step.component.html',
  styleUrls: ['./csv-input-step.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent]
})
export class CsvInputStepComponent implements OnInit {
  private catService = inject(CategoriaServiceService);
  categorias: Categoria[] = [];
  showCatModal = false;
  @Input() initialText: string = '';
  @Output() csvLoaded = new EventEmitter<string>();
  
  csvText: string = '';

  async ngOnInit() {
    this.categorias = await this.catService.getCategorias();
    this.categorias = this.categorias.filter(c => c.activo === 1);
    if (this.initialText) {
      this.csvText = this.initialText;
    }
  }

  async copyAllCategories() {
    const text = this.categorias.map(c => c.id + ':' + c.nombre).join('\n');
    await navigator.clipboard.writeText(text);
    alert('¡Lista de categorías copiada!');
  }

  async copyCatId(cat: Categoria) {
    const text = cat.id + ':' + cat.nombre;
    await navigator.clipboard.writeText(text);
    alert('Copiado: ' + text);
  }

  clearText() {
    this.csvText = '';
  }
  showTutorial: boolean = false;

  async copyTemplate() {
    const text = "titulo,monto,categoriaNum,tipo,tipomonto,cuotas,cuotasPagadas,fecha,estado\nDesayuno,50,1,U,,,,2024-01-01,P\nInternet,300,2,R,,,,2024-01-01,P\nCelular,1200,3,C,T,12,2,2024-01-01,";
    await navigator.clipboard.writeText(text);
    alert('¡Plantilla copiada!');
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.csvText = e.target?.result as string;
      };
      reader.readAsText(file);
    }
  }

  getIcon(name: string) { return getIconPath(name); }

  processText() {
    if (this.csvText.trim()) {
      this.csvLoaded.emit(this.csvText);
    }
  }
}
