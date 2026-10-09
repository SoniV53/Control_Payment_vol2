import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { IonList, IonItemSliding, IonItem, IonItemOptions, IonItemOption, IonIcon, IonTitle, IonToggle, IonLabel, IonButton } from '@ionic/angular/standalone';
import { getIconPath } from 'src/app/utils/Utils';
import { ModalTemplateComponent } from 'src/app/component/modal/modal-template/modal-template.component';
import { FormsModule } from '@angular/forms';
import { InputSimpleComponent } from 'src/app/component/input/input-simple/input-simple.component';
import { RouterLink } from '@angular/router';
import { DynamicFormComponent } from 'src/app/component/form/dynamic-form/dynamic-form.component';
import { ItemInputData } from 'src/app/models/ItemInputData.model';
import { NavCtrl } from 'src/app/services/nav-ctrl';

@Component({
  selector: 'app-payment-category-block',
  templateUrl: './payment-category-block.component.html',
  styleUrls: ['./payment-category-block.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ModalTemplateComponent, InputSimpleComponent, RouterLink, DynamicFormComponent, IonList, IonItemSliding, IonItem, IonItemOptions, IonItemOption, IonIcon, IonTitle, IonToggle, IonLabel, IonButton],
  encapsulation: ViewEncapsulation.None
})
export class PaymentCategoryBlockComponent {
  @Input() categoria: any;
  @Input() categoriasList: any[] = [];

  @Output() editGasto = new EventEmitter<any>();
  @Output() deleteGasto = new EventEmitter<any>();
  @Output() togglePago = new EventEmitter<{gasto: any, isChecked: boolean}>();
  @Output() reloadRecurrente = new EventEmitter<{gasto: any, callback: (data: any) => void}>();

  isModalOpen = false;
  gastoSeleccionado: any = null;
  listaFormulario: ItemInputData[] = [];

  formEdit = {
    titulo: '',
    monto: 0,
    categoria_id: 0
  };

  constructor(public navCtrl: NavCtrl) {}

  getIcon(icon: string) {
    return getIconPath(icon, 'assets/ionicons/bar-chart-outline.svg');
  }

    clickItem(gasto: any) {
    this.gastoSeleccionado = { ...gasto }; // use a shallow copy to avoid changing list before saving
    this.formEdit.titulo = gasto.titulo;
    this.formEdit.monto = gasto.monto;
    this.formEdit.categoria_id = gasto.categoria_id;

    const listCat = this.categoriasList.map(c => ({ code: c.id, value: c.nombre, icon: c.icono }));

    this.listaFormulario = [
      { id: 'titulo', titulo: 'Título', isError: false, placeholder: 'Ingrese el título', tipo: 'text', required: true, valueSelect: gasto.titulo },
      { id: 'monto', titulo: 'Monto', isError: false, placeholder: 'Ingrese el monto', tipo: 'number', required: true, valueSelect: gasto.monto }
    ];

    if (gasto.tipo === 'normal' || !gasto.tipo || gasto.tipo === 'recurrente') {
      this.listaFormulario.push({ 
        id: 'categoria', 
        titulo: 'Categoría', 
        isError: false, 
        placeholder: 'Seleccione la categoría', 
        tipo: 'select', 
        required: true, 
        list: listCat, 
        valueSelect: gasto.categoria_id 
      });
    }

    this.isModalOpen = true;
  }

  onToggleSwipe(gasto: any, slidingItem?: any) {
    const isChecked = gasto.estado === 1 ? false : true;
    
    // Update original reference in the list so UI updates immediately
    const originalGasto = this.categoria.dataGasto.find((g: any) => g.id === gasto.id);
    if (originalGasto) {
      originalGasto.estado = isChecked ? 1 : 0;
    }
    
    this.togglePago.emit({ gasto, isChecked });

    if (slidingItem) {
      slidingItem.close();
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onDoubleClick(gasto: any) {
    const isChecked = gasto.estado === 1 ? false : true;
    gasto.estado = isChecked ? 1 : 0; // Update UI immediately
    this.togglePago.emit({ gasto, isChecked });
  }
  
  onToggleChange(event: any) {
    if (this.gastoSeleccionado) {
       this.gastoSeleccionado.estado = event.detail.checked ? 1 : 0;
       
       // Update original reference in the list so UI updates immediately
       const originalGasto = this.categoria.dataGasto.find((g: any) => g.id === this.gastoSeleccionado.id);
       if (originalGasto) {
         originalGasto.estado = this.gastoSeleccionado.estado;
       }

       // Emit the change to the parent immediately so the DB is updated and the SweetAlert is shown
       this.togglePago.emit({ gasto: this.gastoSeleccionado, isChecked: event.detail.checked });
    }
  }

    saveEdit() {
    this.gastoSeleccionado.titulo = this.listaFormulario.find(item => item.id === 'titulo')?.valueSelect;
    this.gastoSeleccionado.monto = this.listaFormulario.find(item => item.id === 'monto')?.valueSelect;
    
    // Allow category editing for both normal and recurrente
    if (this.gastoSeleccionado.tipo === 'normal' || !this.gastoSeleccionado.tipo || this.gastoSeleccionado.tipo === 'recurrente') {
      this.gastoSeleccionado.categoria_id = Number(this.listaFormulario.find(item => item.id === 'categoria')?.valueSelect) || this.gastoSeleccionado.categoria_id;
    }

    this.editGasto.emit(this.gastoSeleccionado);
    this.closeModal();
  }

  onDelete() {
    this.deleteGasto.emit(this.gastoSeleccionado);
    this.closeModal();
  }

    restablecerRecurrente() {
    if (this.gastoSeleccionado && this.gastoSeleccionado.tipo === 'recurrente') {
      this.reloadRecurrente.emit({
        gasto: this.gastoSeleccionado,
        callback: (originalRecurrente: any) => {
          const tituloItem = this.listaFormulario.find(item => item.id === 'titulo');
          if (tituloItem) tituloItem.valueSelect = originalRecurrente.titulo;
          const montoItem = this.listaFormulario.find(item => item.id === 'monto');
          if (montoItem) montoItem.valueSelect = originalRecurrente.monto;
        }
      });
    }
  }

  onClickNavigate(ruta: string) {
    this.closeModal();
    setTimeout(() => {
      this.navCtrl.push(ruta);
    }, 300);
  }
}
