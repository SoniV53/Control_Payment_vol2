import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ValueAccessorBase } from '../../form/value-accessor';
import { IonSelect, IonSelectOption, IonIcon, IonGrid, IonRow, IonCol, IonInput, IonItem, IonLabel } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { getIconPath } from 'src/app/utils/Utils';
import { ModalBaseComponent } from "../../modal-base/modal-base.component";

@Component({
  selector: 'selector-simple',
  templateUrl: './selector-simple.component.html',
  styleUrls: ['./selector-simple.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SelectorSimpleComponent,
      multi: true
    }
  ],
  imports: [IonLabel, IonItem, IonInput, IonCol, IonRow, IonGrid, IonIcon, IonSelect, IonSelectOption, CommonModule, ModalBaseComponent],

})
export class SelectorSimpleComponent extends ValueAccessorBase<string> implements OnInit {
  @Input() label: string = "";
  @Input() placeholder: string = "";
  @Input() required: boolean = false;
  @Input() name: string = "";
  @Input() list?: any[] = [];
  @Input() defaultSelect: boolean = true;
  @Input() open: boolean = false;
  @Input() valueSelect: string = '';
  @Input() icon: string = '';


  @Output() blurInput: EventEmitter<string> = new EventEmitter<any>();
  @Output() ionChangeInput: EventEmitter<string> = new EventEmitter<any>();
  @Output() clickItem: EventEmitter<string> = new EventEmitter<any>();

  ngOnInit() {
    console.log('List in SelectorSimpleComponent:', this.list);
  }

  onIonChange(event: any) {
    this.value = event.detail.value;

    this.ionChangeInput.emit(this.value);
  }

  onBlurInput(value: string) {
    this.blurInput.emit(value);
  }

  getIcon(icon: string) {
    return getIconPath(icon, 'assets/ionicons/bar-chart-outline.svg');
  }

  onClickItem() {
    
    this.clickItem.emit();
  }
}
