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
  
  // Controles de Vista y Filtros
  vistaActual: 'lista' | 'grafica' = 'lista';
  tabFiltro: string = 'todos';
  anioSeleccionado: number = new Date().getFullYear();
  aniosDisponibles: number[] = [];
  
  // Datos
  gastosBrutos: any[] = [];
  gruposHistorial: any[] = [];
  
  // Datos para Gráfica
  datosGrafica: { mes: string, total: number, porcentaje: number }[] = [];
  maximoGastoMes: number = 0;
  totalAnio: number = 0;

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
        this.extraerAniosDisponibles();
        this.procesarYAgruparDatos();
      },
      async () => { this.getAlertError('No se pudo cargar el historial.'); },
      async () => { this.dissmissLoader(); }
    );
  }

  extraerAniosDisponibles() {
    const aniosSet = new Set<number>();
    this.gastosBrutos.forEach(g => {
      if (g.fecha) {
        const anio = parseInt(g.fecha.split('-')[0]);
        if (!isNaN(anio)) aniosSet.add(anio);
      }
    });
    
    this.aniosDisponibles = Array.from(aniosSet).sort((a, b) => b - a); // Mayor a menor
    
    // Asegurar que el año actual/seleccionado siempre esté en la lista
    if (!this.aniosDisponibles.includes(this.anioSeleccionado)) {
      this.aniosDisponibles.push(this.anioSeleccionado);
      this.aniosDisponibles.sort((a, b) => b - a);
    }
  }

  procesarYAgruparDatos() {
    this.totalAnio = 0;

    // 1. Filtrar por Año y Tipo
    const datosFiltrados = this.gastosBrutos.filter(gasto => {
      if (!gasto.fecha) return false;
      const gastoAnio = parseInt(gasto.fecha.split('-')[0]);
      
      // Filtro de Año
      if (gastoAnio !== this.anioSeleccionado) return false;

      // Filtro de Pestaña (Tipo)
      if (this.tabFiltro === 'recurrentes' && gasto.tipo === 'cuota') return false;
      if (this.tabFiltro === 'cuotas' && gasto.tipo !== 'cuota') return false;
      
      return true;
    });

    // 2. Agrupar para la Vista de LISTA (Mes Año)
    const gruposMap = datosFiltrados.reduce((acc: any, cur: any) => {
      let llave = 'Fecha Desconocida';
      if (cur.fecha) {
        const partes = cur.fecha.split('-');
        if (partes.length >= 2) {
          const nombreMes = this.getNameMonth(partes[1]);
          llave = `${nombreMes} ${partes[0]}`;
        }
      }

      if (!acc[llave]) {
        acc[llave] = { titulo: llave, items: [] };
      }
      acc[llave].items.push(cur);
      this.totalAnio += (cur.monto || 0);
      
      return acc;
    }, {});

    this.gruposHistorial = Object.values(gruposMap);

    // 3. Agrupar para la Vista de GRÁFICA (Resumen de 12 meses)
    this.generarDatosGrafica(datosFiltrados);
  }

  generarDatosGrafica(datos: any[]) {
    // Array de 12 posiciones (0 = Enero, 11 = Diciembre)
    const totalesMes = new Array(12).fill(0);
    
    datos.forEach(g => {
      if (g.fecha) {
        const mesIdx = parseInt(g.fecha.split('-')[1]) - 1;
        if (mesIdx >= 0 && mesIdx <= 11) {
          totalesMes[mesIdx] += (g.monto || 0);
        }
      }
    });

    // Obtener el mes con mayor gasto para calcular el 100% de la altura de la barra
    this.maximoGastoMes = Math.max(...totalesMes, 1); 

    this.datosGrafica = totalesMes.map((total, index) => {
      // Usamos el mes formateado (Ej: "01" -> "Ene")
      const mesNumString = (index + 1).toString().padStart(2, '0');
      const nombreMes = this.getNameMonth(mesNumString).substring(0, 3).toUpperCase();
      
      return {
        mes: nombreMes,
        total: total,
        porcentaje: (total / this.maximoGastoMes) * 100
      };
    });
  }

  cambiarFiltroOAno() {
    this.procesarYAgruparDatos();
  }

  verDetalleGasto(gasto: any) {
    console.log("Ver detalle:", gasto);
  }
}