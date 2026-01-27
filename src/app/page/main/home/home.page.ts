import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonGrid, IonRow, IonCol, IonButton, IonInput, IonLabel, IonDatetime } from '@ionic/angular/standalone';
import { CardOptionComponent } from "../../../component/card/card-option/card-option.component";
import { Router, RouterLink } from '@angular/router';
import { DetailsPaymentComponent } from "src/app/component/details-payment/details-payment.component";
import { CategoryPaymentComponent } from "src/app/component/category-payment/category-payment.component";
import { BasePage } from '../base/base.page';
import { AppComponent } from 'src/app/app.component';
import { ComponentModule } from "src/app/component/components.module";

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonDatetime, IonLabel, IonInput, IonCol, IonRow, IonGrid, IonItem, IonContent, IonButton,
    CommonModule, FormsModule, CardOptionComponent, RouterLink, DetailsPaymentComponent, CategoryPaymentComponent, ComponentModule]
})
export class HomePage extends BasePage implements OnInit {

  dateSelect: String = ""
  value = '';
  inputValue = '';
  showPopup = false;

  showKeyboard = true;
  ionRow: any = [
    { title: 'Gastos', description: 'Opcion para visualizar mis gastos por mes', routerLink: '/list-payments-month' },
    { title: 'Gestiones', description: 'Opcion para crear un gasto o agregar, ya se para  mes o en el mes seleccionado' },
    //{ title: 'Resumen', description: 'Opcion para visualizar un resumen de los gastos mensuales' },
    //{ title: 'Historial', description: 'Opcion para visualizar un Historial cuanto gasto en cada mes' }
  ];

  ngOnInit() {
    this.dateSelect = this.getFormatDate();
  }

  onClickAction() {
    this.router.navigate(['/tabs/category']);
  }

  closePopupClick() {
    this.showPopup = false;
    console.log('Cerrar popup');
  }

  onMonthYearChange(event: any) {
    const date = new Date(event.detail.value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const selectedDate = `${year}-${month}-${day}`;

    this.myApp.setDateSelected(selectedDate);
    this.dateSelect = this.getFormatDate();
  }

  selectDate() {
    this.showPopup = true;
  }

}
