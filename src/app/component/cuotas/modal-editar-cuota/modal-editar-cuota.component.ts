import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DynamicFormComponent } from 'src/app/component/form/dynamic-form/dynamic-form.component';
import { CustomTabsComponent } from '../../custom-tabs/custom-tabs.component';

@Component({
  selector: 'app-modal-editar-cuota',
  templateUrl: './modal-editar-cuota.component.html',
  styleUrls: ['./modal-editar-cuota.component.scss'],
  imports: [CommonModule, IonicModule, DynamicFormComponent, CustomTabsComponent],
  encapsulation: ViewEncapsulation.None,
})
export class ModalEditarCuotaComponent {
  @Input() isOpen = false;
  @Input() fields: any[] = [];
  
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() guardar = new EventEmitter<any>();
  @Output() formAction = new EventEmitter<any>();
  @Output() formChange = new EventEmitter<any>();

    @Input() modoMonto: string = 'mensual';
  @Output() modoMontoChange = new EventEmitter<string>();

  onModoChange(event: any) {
    this.modoMonto = typeof event === 'string' ? event : event.detail?.value;
    this.modoMontoChange.emit(this.modoMonto);
  }

  cerrarModal() {
    this.isOpen = false;
    this.isOpenChange.emit(this.isOpen);
  }

  manejarCambioFormulario(event: any) {
    this.formChange.emit(event);
  }

  manejarAccionFormulario(event: any) {
    this.formAction.emit(event);
  }

  guardarCambios() {
    this.guardar.emit();
  }
}




