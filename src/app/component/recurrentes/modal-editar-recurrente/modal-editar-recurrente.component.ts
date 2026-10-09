import { Component, EventEmitter, Input, Output, ViewEncapsulation, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ModalTemplateComponent } from '../../modal/modal-template/modal-template.component';
import { getIconPath } from 'src/app/utils/Utils';
import { ItemInputData } from 'src/app/models/ItemInputData.model';
import { DynamicFormComponent } from '../../form/dynamic-form/dynamic-form.component';
import { Categoria } from 'src/app/core/models/categoria.model';

@Component({
  selector: 'app-modal-editar-recurrente',
  templateUrl: './modal-editar-recurrente.component.html',
  styleUrls: ['./modal-editar-recurrente.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ModalTemplateComponent, DynamicFormComponent],
  encapsulation: ViewEncapsulation.None
})
export class ModalEditarRecurrenteComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() editData: any = { titulo: '', monto: 0, categoria_id: null, aplicarAtodos: false };
  @Input() gastosHistoricos: any[] = [];
  @Input() categorias: Categoria[] = [];
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() toggleAll = new EventEmitter<any>();
  @Output() editarGasto = new EventEmitter<any>();
  @Output() eliminarGasto = new EventEmitter<number>();
  @Output() restablecerGasto = new EventEmitter<any>();
  @Output() eliminarRecurrente = new EventEmitter<void>();

  fields: ItemInputData[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['editData'] && this.editData) || (changes['categorias'] && this.categorias)) {
      this.fields = [
        { id: 'titulo', titulo: 'Nombre del Servicio', placeholder: 'Ej. Netflix', tipo: 'text', required: true, isError: false, valueSelect: this.editData.titulo },
        { id: 'monto', titulo: 'Monto Base (GTQ)', placeholder: '0.00', tipo: 'number', required: true, isError: false, valueSelect: this.editData.monto },
        { 
          id: 'categoria_id', 
          titulo: 'Categoría', 
          placeholder: 'Selecciona una categoría', 
          tipo: 'select', 
          required: true, 
          isError: false, 
          valueSelect: this.editData.categoria_id,
          list: this.categorias.map(c => ({ code: c.id!, value: c.nombre }))
        }
      ];
    }
  }

  getIcon(icon: string) {
    return getIconPath(icon, 'assets/ionicons/bar-chart-outline.svg');
  }

  printStado(estado: number): string {
    return estado === 2 ? 'Eliminado' : estado === 1 ? 'Pagado' : 'Pendiente';
  }

  guardar() {
    this.editData.titulo = this.fields.find(f => f.id === 'titulo')?.valueSelect;
    this.editData.monto = this.fields.find(f => f.id === 'monto')?.valueSelect;
    this.editData.categoria_id = this.fields.find(f => f.id === 'categoria_id')?.valueSelect;
    this.save.emit();
  }
}


