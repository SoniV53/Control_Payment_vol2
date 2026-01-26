import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonGrid, IonRow, IonCol, IonButton, IonInput, IonLabel } from '@ionic/angular/standalone';
import { CardOptionComponent } from "../../../component/card/card-option/card-option.component";
import { Router, RouterLink } from '@angular/router';
import { DetailsPaymentComponent } from "src/app/component/details-payment/details-payment.component";
import { CategoryPaymentComponent } from "src/app/component/category-payment/category-payment.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonLabel, IonInput, IonCol, IonRow, IonGrid, IonItem, IonContent, IonButton,
    CommonModule, FormsModule, CardOptionComponent, RouterLink, DetailsPaymentComponent, CategoryPaymentComponent]
})
export class HomePage implements OnInit {

  dateSelect: String = "Noviembre | 2024"
  value = '';
  inputValue = '';

  showKeyboard = true;
  ionRow: any = [
    { title: 'Gastos', description: 'Opcion para visualizar mis gastos por mes',routerLink:'/list-payments-month' },
    { title: 'Gestionar', description: 'Opcion para crear un gasto o agregar, ya se para  mes o en el mes seleccionado' },
    { title: 'Resumen', description: 'Opcion para visualizar un resumen de los gastos mensuales' },
    { title: 'Historial', description: 'Opcion para visualizar un Historial cuanto gasto en cada mes' }
  ];

  constructor(private router: Router) {
  }

  ngOnInit() {
    console.log("HOLA MUNDO")

  }

  onClickAction() {
    this.router.navigate(['/tabs/category']);
  }

}
