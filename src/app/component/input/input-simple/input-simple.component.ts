import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonInput } from "@ionic/angular/standalone";
import { FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';
import { ValueAccessorBase } from '../../form/value-accessor';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'input-simple',
  templateUrl: './input-simple.component.html',
  styleUrls: ['./input-simple.component.scss'],
  imports: [IonInput,FormsModule,CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: InputSimpleComponent,
      multi: true
    }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InputSimpleComponent extends ValueAccessorBase<string> implements OnInit {
 
  @Input() label: string = "";
  @Input() placeholder: string = "";
  @Input() type: string = "text";
  @Input() required: boolean = false;
  @Input() readonly: boolean = false;
  @Input() name: string = "";

  @Output() blurInput: EventEmitter<string> = new EventEmitter<any>();
  @Output() ionChangeInput: EventEmitter<string> = new EventEmitter<any>();

  ngOnInit() { }

  onInput(event: any) {
    this.value = event.detail.value;

    this.ionChangeInput.emit(this.value);
  }

  onBlurInput(value: string) {
    this.blurInput.emit(value);
  }

}
