import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonInput } from '@ionic/angular/standalone';
import { BannerTopComponent } from "../../../component/card/banner-top/banner-top.component";
import { BasePage } from '../../main/base/base.page';
import { GastoRecurrente } from 'src/app/core/models/gasto_recurrente.model';

@Component({
  selector: 'app-add-payment',
  templateUrl: './add-payment.page.html',
  styleUrls: ['./add-payment.page.scss'],
  standalone: true,
  imports: [IonInput, IonContent, CommonModule, FormsModule, BannerTopComponent]
})
export class AddPaymentPage extends BasePage implements OnInit {
  toolBar = {
    title: "Gastos Recurrentes",
    description: "A qui puedes visualizar tus gastos Recurrentes"
  }

  listadoGastosRecurrentes:GastoRecurrente[] = []

  ngOnInit() {
  }

    ionViewWillEnter() {

    this.getRecurrentes();

  }

  getRecurrentes() {
      this.baseService(async (params) => {
        this.showLoader()
        this.listadoGastosRecurrentes = await this.gastoService.getGastosRecurrentes();
        
      }, async () => {
        this.getAlertError('No se pudieron cargar.');
      }, async () => {
        this.dissmissLoader();
      });
    }
  
}
