import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonButton } from "@ionic/angular/standalone";

@Component({
  selector: 'app-button-simple',
  templateUrl: './button-simple.component.html',
  styleUrls: ['./button-simple.component.scss'],
  imports: [IonButton,CommonModule],
})
export class ButtonSimpleComponent implements OnInit {
  @Input() tipo: 'primary' | 'delete' = 'primary'
  @Input() isLeftbtnHiden: boolean = false;
  @Input() isRightbtnHiden: boolean = false;
  @Input() disabledL: boolean = false;
  @Input() disabledR: boolean = false;
  @Input() textLeft: string = 'Aceptar';
  @Input() textRight: string = 'Cancelar';
  @Input() colorL: string = '';
  @Input() backgroudL: string = '';
  @Input() colorR: string = 'var(--color-tag-white)';
  @Input() backgroudR: string = 'var(--color-red-primary)';
  @Output() clickLeftButton: EventEmitter<any> = new EventEmitter<any>();
  @Output() clickRigthButton: EventEmitter<any> = new EventEmitter<any>();

  // --background: var(--ion-color-success);
  // --color: var(--ion-background-color);

  constructor() { }

  ngOnInit() { }

  colorStyle(color: string): string {
    return color ? `${color}` : `var(--ion-background-color)`
  }
  backgroudStyle(color: string): string {
    return color ? `${color}` : `var(--ion-color-success)`
  }

  onClickLeft() {
    this.clickLeftButton.emit();
  }

  onClickRight() {
    this.clickRigthButton.emit();
  }

}
