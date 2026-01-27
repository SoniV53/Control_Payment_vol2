import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonInput } from '@ionic/angular/standalone';
import { BannerTopComponent } from "../../../component/card/banner-top/banner-top.component";

@Component({
  selector: 'app-add-payment',
  templateUrl: './add-payment.page.html',
  styleUrls: ['./add-payment.page.scss'],
  standalone: true,
  imports: [IonInput, IonContent, CommonModule, FormsModule, BannerTopComponent]
})
export class AddPaymentPage implements OnInit {
  toolBar = {
    title: "Gastos Mensuales",
    description: "A qui puedes agregar los gastos mensuales para el mes de Noviembre"
  }

  constructor() { }

  ngOnInit() {
  }

}
