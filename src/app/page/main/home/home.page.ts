import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonGrid, IonRow, IonCol, IonDatetime, IonIcon } from '@ionic/angular/standalone';
import { CardOptionComponent } from "../../../component/card/card-option/card-option.component";
import { addIcons } from 'ionicons';
import { calendarOutline, chevronDownOutline, addOutline, listOutline, pieChartOutline, timeOutline, receiptOutline, walletOutline, arrowUpOutline, arrowDownOutline } from 'ionicons/icons';

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
  'arrow-up-outline': arrowUpOutline,
  'arrow-down-outline': arrowDownOutline
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

  // Tendencia
  porcentajeTendencia: number | null = null;
  esTendenciaPositiva: boolean = true;
  totalMesAnterior: number = 0;

  async loadDashboardData() {
    this.baseService(async () => {
      if (this.myApp.dateSelected) {
        // Obtenemos el total de gastos del mes actual
        this.totalGastos = await this.gastoService.getTotalGastosPorMes(this.myApp.dateSelected);
        
        // Calcular mes anterior
        const currentDate = new Date(this.myApp.dateSelected);
        // Evitamos problemas de zona horaria usando UTC o setMonth
        currentDate.setMonth(currentDate.getMonth() - 1);
        const yyyy = currentDate.getFullYear();
        const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
        const prevMonthDateStr = `${yyyy}-${mm}-01`;

        this.totalMesAnterior = await this.gastoService.getTotalGastosPorMes(prevMonthDateStr);

        if (this.totalMesAnterior > 0) {
          const diff = this.totalGastos - this.totalMesAnterior;
          this.porcentajeTendencia = Math.abs((diff / this.totalMesAnterior) * 100);
          this.esTendenciaPositiva = diff <= 0; // Gastó menos o igual (bien)
        } else {
          this.porcentajeTendencia = null; // No hay referencia
        }

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
