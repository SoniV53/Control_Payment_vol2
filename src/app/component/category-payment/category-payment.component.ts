import { Component, Input, OnInit } from '@angular/core';
import { DetailsPaymentComponent } from "../details-payment/details-payment.component";
import { CommonModule } from '@angular/common';
import { Gasto } from 'src/app/core/models/gasto.model';
import { GastoCuota } from 'src/app/core/models/gasto-cuota.model';
import { Categoria } from 'src/app/core/models/categoria.model';
import { IonItem, IonIcon } from "@ionic/angular/standalone";
import { formatearMonto, getIconPath } from 'src/app/utils/Utils';

@Component({
  selector: 'app-category-payment',
  templateUrl: './category-payment.component.html',
  styleUrls: ['./category-payment.component.scss'],
  imports: [IonIcon, IonItem, DetailsPaymentComponent, CommonModule],
})
export class CategoryPaymentComponent implements OnInit {

  @Input() dataGasto: Gasto[] = []
  @Input() dataCategoria?: Categoria

  dataGastoCuota?: GastoCuota

  mostrar: boolean = false;
  textMostrar = '+';

  constructor() { }

  ngOnInit() { }

  onClickMostrar() {
    this.mostrar = !this.mostrar;
    this.textMostrar = this.mostrar ? '-' : '+';
  }

  getIcon(icon: string) {
    return getIconPath(icon, 'assets/ionicons/bar-chart-outline.svg');
  }

  getTotalCategoriaMonto(){
    let total = 100000;
    this.dataGasto.forEach(res => {
      const monto = res.tipo === "cuota" ? res.gastoCuota?.monto_cuota || 0 : res.monto;
      total += monto;
    })

    return formatearMonto(total);
  }
}
