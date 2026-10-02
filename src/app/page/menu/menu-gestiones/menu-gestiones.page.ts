import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonCol, IonIcon, IonItem, IonLabel } from '@ionic/angular/standalone';
import { BannerTopComponent } from "src/app/component/card/banner-top/banner-top.component";
import { CardOptionComponent } from "src/app/component/card/card-option/card-option.component";
import { BasePage } from '../../main/base/base.page';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { addIcons } from 'ionicons';
import { calendarOutline, syncOutline, pieChartOutline, pricetagsOutline, timeOutline, barChartOutline, chevronForwardOutline } from 'ionicons/icons';

addIcons({
  'calendar-outline': calendarOutline,
  'sync-outline': syncOutline,
  'pie-chart-outline': pieChartOutline,
  'pricetags-outline': pricetagsOutline,
  'time-outline': timeOutline,
  'bar-chart-outline': barChartOutline,
  'chevron-forward-outline': chevronForwardOutline
});

@Component({
  selector: 'app-menu-gestiones',
  templateUrl: './menu-gestiones.page.html',
  styleUrls: ['./menu-gestiones.page.scss'],
  standalone: true,
  imports: [IonFooter, IonContent, IonHeader, IonToolbar, IonIcon, IonItem, IonLabel, CommonModule, FormsModule, BannerTopComponent, CardOptionComponent, RouterLink],
})
export class MenuGestionesPage extends BasePage implements OnInit {

  toolBar = {
    title: "Gestiones",
    description: "Aquí puedes administrar las gestiones de tus gastos recurrentes y categorías.",
  }

  categoriaRow: any = [
    {
      title: 'Administración de Gastos', listado: [
        { title: 'Gastos Mensuales', routerLink: '/list-payments-month', icon: 'calendar-outline', desc: 'Registros del mes actual' },
        { title: 'Gastos Recurrentes', routerLink: '/control-recurrentes', icon: 'sync-outline', desc: 'Pagos fijos cada mes' },
        { title: 'Gastos en Cuotas', routerLink: '/control-cuotas', icon: 'pie-chart-outline', desc: 'Pagos divididos a plazos' },
      ]
    },
    {
      title: 'Configuración y Reportes', listado: [
        { title: 'Categorías', routerLink: '/categoria', icon: 'pricetags-outline', desc: 'Administrar rubros' },
        { title: 'Historial General', routerLink: '/historial-gastos', icon: 'time-outline', desc: 'Ver todos los meses' },
        { title: 'Resumen Financiero', routerLink: '/resumen-gastos', icon: 'bar-chart-outline', desc: 'Análisis detallado' },
      ]
    },
  ]

  ngOnInit() {
  }

}
