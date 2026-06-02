import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

import { BasePage } from '../main/base/base.page';
import { GastoServiceService } from 'src/app/services/gasto-service.service';
import { CategoriaServiceService } from 'src/app/services/categoria-service.service';
import { BannerTopComponent } from "src/app/component/card/banner-top/banner-top.component";
import { AppComponent } from 'src/app/app.component';
import { ControlGastosAutomaticosService } from 'src/app/services/control-gastos-automaticos.service';
import { NavCtrl } from 'src/app/services/nav-ctrl';

import { HistorialServiceService } from 'src/app/services/historial-service.service';

@Component({
  selector: 'app-historial-gastos',
  templateUrl: './historial-gastos.page.html',
  styleUrls: ['./historial-gastos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, BannerTopComponent]
})
export class HistorialGastosPage extends BasePage {
  toolBar = { title: "Historial", description: "Revisa todos tus movimientos." };
  
  // Segmento de filtro
  tabFiltro = 'todos';
  
  // Datos
  gastosBrutos: any[] = [];
  gruposHistorial: any[] = [];

  constructor(
    public override router: Router,
    public override myApp: AppComponent,
    public override gastoService: GastoServiceService,
    public override fb: FormBuilder,
    public override categoriaService: CategoriaServiceService,
    public override controlService: ControlGastosAutomaticosService,
    public override toastController: ToastController,
    public override navCtrl: NavCtrl,
    public override alertController: AlertController,
    private historialService: HistorialServiceService
  ) {
    super(router, myApp, gastoService, fb, categoriaService, controlService, toastController, navCtrl, alertController);
  }

  ionViewWillEnter() {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.baseService(
      async () => {
        this.showLoader();
        this.gastosBrutos = await this.historialService.getHistorialCompleto();
        this.procesarYAgruparDatos();
      },
      async () => { this.getAlertError('No se pudo cargar el historial.'); },
      async () => { this.dissmissLoader(); }
    );
  }

  procesarYAgruparDatos() {
    // 1. Filtrar los datos según el segmento (Todos, Recurrentes, Cuotas)
    const datosFiltrados = this.gastosBrutos.filter(gasto => {
      if (this.tabFiltro === 'todos') return true;
      if (this.tabFiltro === 'recurrentes') return gasto.tipo !== 'cuota'; // O la lógica exacta de tu BD para recurrentes
      if (this.tabFiltro === 'cuotas') return gasto.tipo === 'cuota';
      return true;
    });

    // 2. Agrupar por "Mes Año" (Ej: "Mayo 2024")
    const gruposMap = datosFiltrados.reduce((acc: any, cur: any) => {
      let llave = 'Fecha Desconocida';
      
      if (cur.fecha) {
        // Asumiendo formato YYYY-MM-DD
        const partes = cur.fecha.split('-');
        if (partes.length >= 2) {
          const anio = partes[0];
          const mes = partes[1];
          // Usamos tu método heredado de BasePage
          const nombreMes = this.getNameMonth(mes);
          llave = `${nombreMes} ${anio}`;
        }
      }

      if (!acc[llave]) {
        acc[llave] = { titulo: llave, items: [] };
      }
      acc[llave].items.push(cur);
      
      return acc;
    }, {});

    // Convertir a Array para iterar en el HTML
    this.gruposHistorial = Object.values(gruposMap);
  }

  cambiarFiltro() {
    this.procesarYAgruparDatos();
  }

  verDetalleGasto(gasto: any) {
    // Aquí puedes abrir un modal o navegar si quieres ver detalles profundos de ese gasto en el historial
    console.log("Ver detalle:", gasto);
  }
}