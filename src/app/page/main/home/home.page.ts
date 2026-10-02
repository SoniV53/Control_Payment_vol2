import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonGrid, IonRow, IonCol, IonDatetime, IonIcon } from '@ionic/angular/standalone';
import { CardOptionComponent } from "../../../component/card/card-option/card-option.component";
import { addIcons } from 'ionicons';
import { calendarOutline, chevronDownOutline, addOutline, listOutline, pieChartOutline, timeOutline, receiptOutline, walletOutline, arrowUpOutline } from 'ionicons/icons';

import { BasePage } from '../base/base.page';
import { ModalBaseComponent } from "src/app/component/modal-base/modal-base.component";
import { UpdateListado } from 'src/app/utils/update-params';
import { getIconPath } from 'src/app/utils/Utils';

addIcons({
  'calendar-outline': calendarOutline,
  'chevron-down-outline': chevronDownOutline,
  'add-outline': addOutline,
  'list-outline': listOutline,
  'pie-chart-outline': pieChartOutline,
  'time-outline': timeOutline,
  'receipt-outline': receiptOutline,
  'wallet-outline': walletOutline,
  'arrow-up-outline': arrowUpOutline
});

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonDatetime, IonCol, IonRow, IonGrid, IonItem, IonContent, IonIcon,
    CommonModule, FormsModule, CardOptionComponent, ModalBaseComponent]
})
export class HomePage extends BasePage implements OnInit {

  dateSelect: String = ""
  value = '';
  inputValue = '';
  showPopup = false;
  showKeyboard = true;

  // Variables para el Dashboard UI
  totalGastos: number = 0;
  recentExpenses: any[] = []; 

 

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.dateSelect = this.getFormatDate();
    this.historialNavigation();
    this.loadDashboardData();
  }

  async loadDashboardData() {
    this.baseService(async () => {
      if (this.myApp.dateSelected) {
        // Obtenemos el total de gastos del mes actual
        this.totalGastos = await this.gastoService.getTotalGastosPorMes(this.myApp.dateSelected);
        
        // Obtenemos los últimos movimientos del mes (límite 4)
        this.recentExpenses = await this.gastoService.getUltimosMovimientos(this.myApp.dateSelected, 4);
      }
    });
  }

  ionViewDidLeave() {
    this.closePopupClick();
  }

  onClickAction() {
    this.router.navigate(['/category']);
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
    this.dateSelect = this.getFormatDate();
    this.loadUpdateParam(UpdateListado.UPDATE_RECURRENTE, true);
    this.loadUpdateParam(UpdateListado.UPDATE_CATEGORIA, true);
    this.loadDashboardData();
  }

  selectDate() {
    this.showPopup = true;
  }

  navegacion(ruta: string) {
    this.navCtrl.push(ruta);
  }
}
