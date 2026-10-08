import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SelectorModalComponent } from 'src/app/component/input/selector-modal/selector-modal.component';
import { InputSimpleComponent } from 'src/app/component/input/input-simple/input-simple.component';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, SelectorModalComponent, InputSimpleComponent],
  encapsulation: ViewEncapsulation.None
})
export class DynamicFormComponent {
  @Input() fields: any[] = [];
  
  @Output() formChange = new EventEmitter<any>();
  @Output() formBlur = new EventEmitter<any>();
  @Output() formAction = new EventEmitter<{action: string, field?: any}>();

  ionChangeInput(field: any) {
    this.formChange.emit(field);
  }

  blurInput(field: any) {
    this.formBlur.emit(field);
  }

  clickDateModal(field: any) {
    this.formAction.emit({ action: 'date-modal', field });
  }

  actionButtonClick(field: any) {
    // Cuando hacen click en "Crear Nueva Opción" (Ej. Crear Nueva Categoría)
    this.formAction.emit({ action: 'select-action', field });
  }
}

