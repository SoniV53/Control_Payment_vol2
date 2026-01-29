import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BannerTopComponent } from "../../../component/card/banner-top/banner-top.component";
import { CategoryPaymentComponent } from "src/app/component/category-payment/category-payment.component";
import { BasePage } from '../../main/base/base.page';
import { IonicModule } from "@ionic/angular";
import { ModalBaseComponent } from "src/app/component/modal-base/modal-base.component";
import { IonItem, IonContent, IonChip, IonDatetime } from "@ionic/angular/standalone";

@Component({
  selector: 'app-list-payments-month',
  templateUrl: './list-payments-month.page.html',
  styleUrls: ['./list-payments-month.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BannerTopComponent,
    CategoryPaymentComponent,
    ModalBaseComponent,
    IonItem,
    IonContent,
    IonChip,
    IonDatetime
]
})
export class ListPaymentsMonthPage extends BasePage implements OnInit {
  toolBar = {
    title: "Noviembre | 2024",
    description: "Visualiza los gastos realizados en el mes",
  }
  showPopup = false;


  ngOnInit() {
    this.toolBar.title = this.getFormatDate();
  }

   ionViewWillEnter() {
    this.toolBar.title = this.getFormatDate();
  }

  closePopupClick() {
    this.showPopup = false;
  }

  onMonthYearChange(event: any) {
    const date = new Date(event.detail.value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const selectedDate = `${year}-${month}-${day}`;

    this.myApp.setDateSelected(selectedDate);
    this.toolBar.title = this.getFormatDate();
  }

  selectDate() {
    this.showPopup = true;
  }

  onActionTitle() {
    this.selectDate();
  }

}
