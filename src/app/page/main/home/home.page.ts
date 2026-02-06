import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonGrid, IonRow, IonCol, IonButton, IonInput, IonLabel, IonDatetime } from '@ionic/angular/standalone';
import { CardOptionComponent } from "../../../component/card/card-option/card-option.component";
import { RouterLink } from '@angular/router';
import { BasePage } from '../base/base.page';
import { ModalBaseComponent } from "src/app/component/modal-base/modal-base.component";
import { UpdateListado } from 'src/app/utils/update-params';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonDatetime, IonCol, IonRow, IonGrid, IonItem, IonContent,
    CommonModule, FormsModule, CardOptionComponent, ModalBaseComponent]
})
export class HomePage extends BasePage implements OnInit {

  dateSelect: String = ""
  value = '';
  inputValue = '';
  showPopup = false;

  showKeyboard = true;
  ionRow: any = [
    { title: 'Gastos', description: 'Opcion para visualizar mis gastos por mes', routerLink: 'ListPaymentsMonthPage' },
    { title: 'Gestiones', description: 'Opcion para crear un gasto o agregar, ya se para  mes o en el mes seleccionado', routerLink: 'MenuGestionesPage' },
    //{ title: 'Resumen', description: 'Opcion para visualizar un resumen de los gastos mensuales' },
    //{ title: 'Historial', description: 'Opcion para visualizar un Historial cuanto gasto en cada mes' }
  ];

  ngOnInit() {
    // this.dateSelect = this.getFormatDate();
  }

  async ionViewWillEnter() {
    this.dateSelect = this.getFormatDate();
    this.historialNavigation()
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
  }

  selectDate() {
    this.showPopup = true;
  }

  navegacion(ruta: string) {
    this.navCtrl.push(ruta)
  }
}
