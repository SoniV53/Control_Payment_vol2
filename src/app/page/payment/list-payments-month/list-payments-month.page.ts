import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonIcon, IonLabel, IonChip } from '@ionic/angular/standalone';
import { BannerTopComponent } from "../../../component/card/banner-top/banner-top.component";
import { CategoryPaymentComponent } from "src/app/component/category-payment/category-payment.component";

@Component({
  selector: 'app-list-payments-month',
  templateUrl: './list-payments-month.page.html',
  styleUrls: ['./list-payments-month.page.scss'],
  standalone: true,
  imports: [IonChip, IonLabel, IonIcon, IonItem, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, BannerTopComponent, CategoryPaymentComponent]
})
export class ListPaymentsMonthPage implements OnInit {
  toolBar = {
    title: "Noviembre | 2024",
    description: ""
  }
  constructor() { }

  ngOnInit() {
  }

}
