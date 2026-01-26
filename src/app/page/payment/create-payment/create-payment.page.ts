import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { BannerTopComponent } from "../../../component/card/banner-top/banner-top.component";

@Component({
  selector: 'app-create-payment',
  templateUrl: './create-payment.page.html',
  styleUrls: ['./create-payment.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, BannerTopComponent]
})
export class CreatePaymentPage implements OnInit {
  toolBar = {
    title: "Nuevo Gasto Noviembre ",
    description: "Crea gasto para el mes de Noviembre"
  }
  constructor() { }

  ngOnInit() {
  }

}
