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
  imports: [IonFooter, IonContent, IonHeader, IonToolbar, CommonModule, FormsModule, BannerTopComponent, CardOptionComponent, RouterLink],
})
export class MenuGestionesPage extends BasePage implements OnInit {

  toolBar = {
    title: "Gestiones",
    description: "Aquí puedes administrar las gestiones de tus gastos recurrentes y categorías.",
  }

  categoriaRow: any = [

    {
      title: 'Todo los Gastos:', listado: [
        { title: 'Gastos Mensuales', routerLink: '/list-payments-month' },
        { title: 'Gestion Gastos Recurrentes', routerLink: '/control-recurrentes' },
        { title: 'Gestion Gastos por Cuotas', routerLink: '/control-cuotas' },
      ]
    },
    {
      title: 'Otros:', listado: [
        { title: 'Categorías', routerLink: '/categoria', icon: 'albums-outline' },
        { title: 'Historial', routerLink: '/historial-gastos', icon: 'albums-outline' },
        { title: 'Resumen', routerLink: '/resumen-gastos', icon: 'albums-outline' },
        // { title: 'Etiquetas', routerLink: '/gestiones' },
      ]
    },
  ]

  ngOnInit() {
  }

}
