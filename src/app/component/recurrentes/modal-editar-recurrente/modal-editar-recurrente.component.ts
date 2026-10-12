import { Component, EventEmitter, Input, Output, ViewEncapsulation, SimpleChanges, OnChanges, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { IonSpinner } from '@ionic/angular/standalone';
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
  imports: [CommonModule, IonicModule, FormsModule, ModalTemplateComponent, DynamicFormComponent, IonSpinner],
  encapsulation: ViewEncapsulation.None
})
export class ModalEditarRecurrenteComponent implements OnChanges, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() editData: any = { titulo: '', monto: 0, categoria_id: null, fechaInicio: '', aplicarAtodos: false };
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
  showDateModal: boolean = false;
  selectedDateField: any = null;
  minYear: string = (new Date().getFullYear() - 15).toString();
  maxYear: string = (new Date().getFullYear() + 10).toString();

  // Scroll inteligente / Paginación progresiva para el historial
  limiteActual: number = 10;
  gastosPaginados: any[] = [];
  cargandoMas: boolean = false;
  private observer?: IntersectionObserver;

  @ViewChild('infiniteSentinel') set sentinelElement(el: ElementRef | undefined) {
    if (el && el.nativeElement) {
      this.initObserver(el.nativeElement);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['gastosHistoricos']) {
      this.limiteActual = 10;
      this.actualizarGastosPaginados();
    }

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
        },
        { 
          id: 'fechaInicio', 
          titulo: 'Fecha de Inicio', 
          placeholder: 'Seleccionar mes de inicio', 
          tipo: 'date', 
          required: true, 
          isError: false, 
          valueSelect: this.editData.fechaInicio || new Date().toISOString().split('T')[0] 
        }
      ];
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  actualizarGastosPaginados() {
    this.gastosPaginados = (this.gastosHistoricos || []).slice(0, this.limiteActual);
  }

  initObserver(el: HTMLElement) {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first && first.isIntersecting && !this.cargandoMas) {
        if (this.gastosPaginados.length < this.gastosHistoricos.length) {
          this.ejecutarCarga();
        }
      }
    }, {
      root: null,
      rootMargin: '120px',
      threshold: 0.1
    });

    this.observer.observe(el);
  }

  ejecutarCarga() {
    this.cargandoMas = true;
    setTimeout(() => {
      this.limiteActual += 10;
      this.actualizarGastosPaginados();
      this.cargandoMas = false;
    }, 600);
  }

  manejarFormAction(event: any) {
    if (event.action === 'date-modal') {
      this.selectedDateField = event.field;
      this.showDateModal = true;
    }
  }

  onMonthYearChange(event: any) {
    const val = event.detail.value;
    if (val && this.selectedDateField) {
      const yearMonth = val.substring(0, 7);
      this.selectedDateField.valueSelect = `${yearMonth}-01`;
    }
    this.showDateModal = false;
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
    this.editData.fechaInicio = this.fields.find(f => f.id === 'fechaInicio')?.valueSelect;
    this.save.emit();
  }
}


