import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonToggle, IonItem, IonIcon, IonLabel } from "@ionic/angular/standalone";
import { Gasto } from 'src/app/core/models/gasto.model';
import { formatearMonto, getFragmentDate, getIconPath, getNameMonth } from 'src/app/utils/Utils';
@Component({
  selector: 'app-detalle-recurrente',
  templateUrl: './detalle-recurrente.component.html',
  styleUrls: ['./detalle-recurrente.component.scss'],
  standalone: true,
  imports: [IonToggle, CommonModule, IonItem, IonIcon, IonLabel],
})
export class DetalleRecurrenteComponent implements OnInit {
  @Input() gastoData?: Gasto

  isCheck: boolean = false
  constructor() { }

  ngOnInit() {
    this.isCheck = this.gastoData?.estado === 0;

  }

  ionChangeToggle(event: any) {
    this.isCheck = !this.isCheck

    console.log(this.isCheck)
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
