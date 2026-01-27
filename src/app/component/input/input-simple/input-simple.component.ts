import { Component, EventEmitter, Input, input, OnInit, Output } from '@angular/core';
import { IonInput } from "@ionic/angular/standalone";
import { IonicModule } from "@ionic/angular";
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ValueAccessorBase } from '../../form/value-accessor';

@Component({
  selector: 'input-simple',
  templateUrl: './input-simple.component.html',
  styleUrls: ['./input-simple.component.scss'],
  imports: [IonInput],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: InputSimpleComponent,
      multi: true
    }
  ]
})
export class InputSimpleComponent extends ValueAccessorBase<string> implements OnInit {
  @Input() label: string = "";
  @Input() placeholder: string = "";
  @Input() tipo: string = "text";
  @Input() required: boolean = false;
  @Input() name: string = "";

  @Output() blurInput: EventEmitter<string> = new EventEmitter<any>();
  @Output() ionChangeInput: EventEmitter<string> = new EventEmitter<any>();



  ngOnInit() { }

  onInput(event: any) {
    this.value = event.detail.value;
  }

  onBlurInput(value: string) {
    this.blurInput.emit(value);
  }

  onIonChangeInput(value: string) {
    this.ionChangeInput.emit(value);
  }
}
