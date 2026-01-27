import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ValueAccessorBase } from '../../form/value-accessor';
import { IonSelect, IonSelectOption } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';

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
  imports: [IonSelect, IonSelectOption,CommonModule],

})
export class SelectorSimpleComponent extends ValueAccessorBase<string> implements OnInit {
  @Input() label: string = "";
  @Input() placeholder: string = "";
  @Input() required: boolean = false;
  @Input() name: string = "";
  @Input() list?: any[] = [];

  @Output() blurInput: EventEmitter<string> = new EventEmitter<any>();
  @Output() ionChangeInput: EventEmitter<string> = new EventEmitter<any>();

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

}
