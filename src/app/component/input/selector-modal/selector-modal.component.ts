import { Component, EventEmitter, Input, Output, forwardRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { getIconPath } from 'src/app/utils/Utils';
import { SelectorSimpleComponent } from '../selector-simple/selector-simple.component';
import { ValueAccessorBase } from '../../form/value-accessor';

@Component({
  selector: 'app-selector-modal',
  templateUrl: './selector-modal.component.html',
  styleUrls: ['./selector-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, SelectorSimpleComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectorModalComponent),
      multi: true
    }
  ],
  encapsulation: ViewEncapsulation.None
})
export class SelectorModalComponent extends ValueAccessorBase<any> {
  // Configuración del SelectorSimple
  @Input() label: string = '';
  @Input() name: string = '';
  @Input() required: boolean = false;
  @Input() placeholder: string = 'Seleccionar...';
  @Input() list: any[] = [];
  
  // Configuración del Modal
  @Input() modalTitle: string = 'Elegir Opción';
  @Input() actionButtonText: string = '';
  @Input() actionButtonIcon: string = 'add-circle-outline';

  @Output() ionChangeInput = new EventEmitter<any>();
  @Output() actionButtonClick = new EventEmitter<void>();

  showPopup = false;

  get valueSelectName() {
    const item = this.list.find(i => i.code === this.value);
    return item ? item.value : '';
  }

  get valueSelectIcon() {
    const item = this.list.find(i => i.code === this.value);
    return item ? item.icon : '';
  }

  onClickItemAction() {
    this.showPopup = true;
  }

  closePopupClick() {
    this.showPopup = false;
  }

  onClickItem(item: any) {
    this.value = item.code;
    this.ionChangeInput.emit(this.value);
    this.showPopup = false;
  }

  goToActionButton() {
    this.showPopup = false;
    setTimeout(() => {
      this.actionButtonClick.emit();
    }, 150);
  }

  getIcon(icon: string) {
    return getIconPath(icon, 'assets/ionicons/bar-chart-outline.svg');
  }
}

