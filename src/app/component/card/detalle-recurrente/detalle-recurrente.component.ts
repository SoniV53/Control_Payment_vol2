import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonToggle, IonItem, IonIcon, IonLabel, IonButton } from "@ionic/angular/standalone";
import { Gasto } from 'src/app/core/models/gasto.model';
import { formatearMonto, getFragmentDate, getIconPath, getNameMonth } from 'src/app/utils/Utils';
@Component({
  selector: 'app-detalle-recurrente',
  templateUrl: './detalle-recurrente.component.html',
  styleUrls: ['./detalle-recurrente.component.scss'],
  standalone: true,
  imports: [IonToggle, CommonModule, IonItem, IonIcon, IonLabel, IonButton],
})
export class DetalleRecurrenteComponent implements OnInit {
  @Input() gastoData?: Gasto
  @Output() changeToggle: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() clickEdit: EventEmitter<Gasto> = new EventEmitter<Gasto>();

  isCheck: boolean = false
  constructor() { }

  ngOnInit() {
    this.isCheck = this.gastoData?.estado === 0;

  }

  ionChangeToggle(event: any) {
    this.isCheck = !this.isCheck
    this.changeToggle.emit(this.isCheck);
  }

  clickEditItem() {
    if(this.gastoData) {
      this.clickEdit.emit(this.gastoData);
    }
  }

  getIcon(icon: string) {
    return getIconPath(icon, 'assets/ionicons/bar-chart-outline.svg');
  }

  formatearMonto() {
    return formatearMonto(this.gastoData?.monto || 0);
  }
  formatearDate() {
    const [yearI, monthI] = getFragmentDate(this.gastoData?.fecha)
    return `${yearI} / ${getNameMonth(monthI)}`;
  }
}
