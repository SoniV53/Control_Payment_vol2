import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DynamicFormComponent } from 'src/app/component/form/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-modal-editar-cuota',
  templateUrl: './modal-editar-cuota.component.html',
  styleUrls: ['./modal-editar-cuota.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, DynamicFormComponent],
  encapsulation: ViewEncapsulation.None,
})
export class ModalEditarCuotaComponent {
  @Input() isOpen = false;
  @Input() fields: any[] = [];
  
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() guardar = new EventEmitter<any>();
  @Output() formAction = new EventEmitter<any>();

  cerrarModal() {
    this.isOpen = false;
    this.isOpenChange.emit(this.isOpen);
  }

  manejarAccionFormulario(event: any) {
    this.formAction.emit(event);
  }

  guardarCambios() {
    this.guardar.emit();
  }
}

