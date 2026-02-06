import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonCol } from '@ionic/angular/standalone';
import { BannerTopComponent } from "src/app/component/card/banner-top/banner-top.component";
import { CardOptionComponent } from "src/app/component/card/card-option/card-option.component";
import { BasePage } from '../../main/base/base.page';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-menu-gestiones',
  templateUrl: './menu-gestiones.page.html',
  styleUrls: ['./menu-gestiones.page.scss'],
  standalone: true,
  imports: [ IonFooter, IonContent, IonHeader,  IonToolbar, CommonModule, FormsModule, BannerTopComponent, CardOptionComponent, RouterLink],
})
export class MenuGestionesPage extends BasePage implements OnInit {

  toolBar = {
    title: "Gestiones",
    description: "Aquí puedes administrar las gestiones de tus gastos recurrentes y categorías.",
  }

  categoriaRow: any = [
    {
      title: 'Categorías:', listado: [
        { title: 'Categorías', routerLink: '/categoria', icon: 'albums-outline' },
        { title: 'Historial', routerLink: '', icon: 'albums-outline' },
        { title: 'Resumen', routerLink: '', icon: 'albums-outline' },
       // { title: 'Etiquetas', routerLink: '/gestiones' },
      ]
    },
    {
      title: 'Gastos Recurrentes y Cuotas:', listado: [
        { title: 'Gastos', routerLink: '/list-payments-month' },
        { title: 'Gastos Recurrentes', routerLink: '/gestiones' },
        { title: 'Gastos por Cuotas', routerLink: '/gestiones' },
      ]
    },
  ]

  ngOnInit() {
  }

}
