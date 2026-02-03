import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonGrid, IonRow, IonCol, IonChip } from "@ionic/angular/standalone";
import { GastoCuota } from 'src/app/core/models/gasto-cuota.model';
import { Gasto } from 'src/app/core/models/gasto.model';
import { eNumber, formatearMonto } from 'src/app/utils/Utils';

@Component({
  selector: 'app-details-payment',
  templateUrl: './details-payment.component.html',
  styleUrls: ['./details-payment.component.scss'],
  imports: [IonChip, IonCol, IonRow, IonGrid, CommonModule],
})
export class DetailsPaymentComponent implements OnInit {
  @Input() dataGasto?: Gasto

  isCuota = false

  constructor() { }

  ngOnInit() {
    this.isCuota = this.dataGasto?.tipo === "cuota";
  }

  formatoMonto(tipo: number) {
    switch (tipo) {
      case 1:
        return formatearMonto(this.dataGasto?.gastoCuota?.monto_cuota || 0);
      case 2:
        const restante = eNumber(this.dataGasto?.monto) - eNumber(this.dataGasto?.gastoCuota?.monto_cuota);
        return formatearMonto(restante || 0);
      default:
        return formatearMonto(this.dataGasto?.monto || 0);
    }
  }

  getStatusGasto() {
    //--ion-color-danger
    const status = this.isCuota ? this.dataGasto?.gastoCuota?.estado_cuota || 0 : this.dataGasto?.estado || 0;
    return status === 0 ? 'var(--ion-color-danger)' : 'var(--color-blue-primary)'
  }

  formatoCuotas() {
    return `${this.dataGasto?.gastoCuota?.numero_cuota}/${this.dataGasto?.cuotas}`;
  }
}
